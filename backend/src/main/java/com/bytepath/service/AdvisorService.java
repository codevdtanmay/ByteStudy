package com.bytepath.service;

import com.bytepath.data.SyllabusData;
import com.bytepath.model.*;
import com.bytepath.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * ByteAI advisor heuristic engine — direct Java port of {@code askByteAI()}
 * in {@code useAcademicStore.js}.
 * <p>
 * Generates rule-based study advice based on keyword matching against
 * the student's academic standing.
 */
@Service
public class AdvisorService {

    private final ChatMessageRepository chatRepo;
    private final CgpaCalculatorService cgpaService;
    private final RagClient ragClient;
    private final OpenRouterClient openRouterClient;
    private final DocumentSearchService documentSearch;

    public AdvisorService(ChatMessageRepository chatRepo,
                          CgpaCalculatorService cgpaService,
                          RagClient ragClient,
                          OpenRouterClient openRouterClient,
                          DocumentSearchService documentSearch) {
        this.chatRepo    = chatRepo;
        this.cgpaService = cgpaService;
        this.ragClient   = ragClient;
        this.openRouterClient = openRouterClient;
        this.documentSearch = documentSearch;
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /** Return the full chat history for this user, ordered oldest-first. */
    public List<ChatMessage> getHistory(User user) {
        List<ChatMessage> messages = chatRepo.findByUserOrderBySentAtAsc(user);
        if (messages.isEmpty()) {
            // Seed with the ByteAI welcome message
            ChatMessage welcome = ChatMessage.builder()
                .user(user)
                .sender("ai")
                .text("Yo! I'm ByteAI, your study advisor. I've scanned your grades, " +
                      "attendance, and active subjects. Click one of the questions below " +
                      "or ask me anything — I'll write a custom study response based on your standing!")
                .sentAt(Instant.now())
                .build();
            chatRepo.save(welcome);
            return List.of(welcome);
        }
        return messages;
    }

    /**
     * Persist the student's message and generate + persist the AI reply.
     *
     * @param user              the authenticated student
     * @param userText          the raw message text
     * @param semesterRecords   current semester SGPA records (for context)
     * @param attendanceLogs    attendance logs (to compute attendance %)
     * @return the AI-generated reply message
     */
    @Transactional
    public ChatMessage processMessage(
            User user,
            String userText,
            List<SemesterRecord> semesterRecords,
            List<AttendanceLog> attendanceLogs) {

        // 1. Persist the user message
        ChatMessage userMsg = ChatMessage.builder()
            .user(user)
            .sender("user")
            .text(userText.trim())
            .sentAt(Instant.now())
            .build();
        chatRepo.save(userMsg);

        // 2. Compute context
        int    currentSem    = cgpaService.currentSemester(semesterRecords);
        String currentCgpa   = cgpaService.computeCurrentCgpa(semesterRecords);
        double targetCgpa    = user.getTargetCgpa() != null ? user.getTargetCgpa() : 8.50;
        int    remaining     = cgpaService.remainingCredits(semesterRecords);

        CgpaCalculatorService.PredictorResult predictor =
                cgpaService.predict(semesterRecords, targetCgpa);

        String attendancePct = computeAttendancePct(attendanceLogs);

        List<String> activeSubjects = activeSubjectNames(currentSem);

        // 3. Prefer the configured RAG advisor, retaining the local advisor as fallback.
        String academicContext = String.format(
            "Current semester: %d\nCurrent CGPA: %s\nTarget CGPA: %.2f\n" +
            "Remaining credits: %d\nRequired SGPA: %s\nAttendance: %s%%\n" +
            "Active subjects: %s",
            currentSem, currentCgpa, targetCgpa, remaining,
            predictor.requiredSgpa(), attendancePct, String.join(", ", activeSubjects)
        );
        String aiSystem = "You are ByteAI, a concise and supportive academic advisor for a B.Tech CS student. Ground every academic answer in the supplied BytePath context and syllabus. Prefer the student's current semester, but connect prerequisites and later subjects when useful. Be practical, honest about uncertainty, and format useful plans with Markdown. Do not invent grades, attendance, policies, or deadlines.";
        String groundedContext = academicContext + "\n\nFULL BYTEPATH SYLLABUS:\n" + SyllabusData.catalogSummary();
        String documentContext = documentSearch.retrieve(userText, user, 5);
        if (!documentContext.isBlank()) {
            groundedContext += "\n\nRELEVANT UPLOADED DOCUMENT EXCERPTS:\n" + documentContext;
        }
        String reply = openRouterClient.ask(aiSystem, groundedContext + "\n\nStudent question: " + userText.trim(), 1200)
            .or(() -> ragClient.ask(userText.trim(), academicContext))
            .orElseGet(() -> generateReply(userText.toLowerCase(), currentSem, currentCgpa, targetCgpa, remaining, predictor, attendancePct, activeSubjects));

        // 4. Persist and return AI message
        ChatMessage aiMsg = ChatMessage.builder()
            .user(user)
            .sender("ai")
            .text(reply)
            .sentAt(Instant.now())
            .build();
        return chatRepo.save(aiMsg);
    }

    /** Clear all chat messages and re-seed the welcome message. */
    @Transactional
    public void clearHistory(User user) {
        chatRepo.deleteByUser(user);
        ChatMessage welcome = ChatMessage.builder()
            .user(user)
            .sender("ai")
            .text("Chat cleared! Let's start fresh. How can I help you with your B.Tech CS & IT subjects today?")
            .sentAt(Instant.now())
            .build();
        chatRepo.save(welcome);
    }

    // ── Heuristic reply engine (ports askByteAI() from JS) ────────────────────

    private String generateReply(
            String lower,
            int currentSem, String currentCgpa, double targetCgpa,
            int remaining,
            CgpaCalculatorService.PredictorResult predictor,
            String attendancePct,
            List<String> activeSubjects) {

        // Attendance branch
        if (lower.contains("attendance") || lower.contains("safe")
                || lower.contains("shortage")) {
            try {
                double att = Double.parseDouble(attendancePct);
                if (att < 75) {
                    return String.format(
                        "Alert! Your overall attendance is currently at %.1f%%. That's below " +
                        "the 75%% cutoff threshold! You need to attend your upcoming lectures " +
                        "immediately. Head over to the 'Semesters & Attendance' panel to see " +
                        "exactly how many consecutive lectures you need for each course.", att);
                } else {
                    return String.format(
                        "Looking good! Your overall attendance is at %.1f%%, which is safe " +
                        "(>= 75%%). You have some leeway, but keep logging your classes to " +
                        "prevent sudden drops!", att);
                }
            } catch (NumberFormatException e) {
                return "I don't see any attendance logs registered yet! Go to the 'Semesters' " +
                       "page and log some classes. Remember: you need 75%% to take university exams!";
            }
        }

        // Study plan branch
        if (lower.contains("study plan") || lower.contains("timetable")
                || lower.contains("schedule")) {
            if (activeSubjects.isEmpty()) {
                return "You've finished all 8 semesters! Time to study for placements or " +
                       "final dissertation packaging.";
            }
            StringBuilder sb = new StringBuilder();
            sb.append(String.format(
                "Sure! Here's your personalized **Semester %d Study Strategy**:\n\n", currentSem));
            activeSubjects.stream().limit(3).forEach(s ->
                sb.append(String.format(
                    "- **%s**: Focus on weekly tutorials and clear past papers.\n", s)));
            sb.append("\n**Action Plan:** Use the 'Focus Zone' tab for 25-minute Pomodoro sessions. " +
                      "I recommend spending 45 mins/day on your highest-credit course.");
            return sb.toString();
        }

        // CGPA / target branch
        if (lower.contains("target") || lower.contains("cgpa")
                || lower.contains("estimate") || lower.contains("reach")) {
            if (predictor.requiredSgpa() == null) {
                return predictor.message();
            }
            double reqVal = Double.parseDouble(predictor.requiredSgpa());
            if (reqVal > 10) {
                return String.format(
                    "Honestly, a target CGPA of **%.2f** is mathematically unreachable with " +
                    "your remaining credits. You need a future average of **%s**, which is above " +
                    "10.0. I recommend adjusting your target to a reachable level or logging " +
                    "MOOC courses.", targetCgpa, predictor.requiredSgpa());
            } else {
                return String.format(
                    "To hit your target CGPA of **%.2f** (current standing: **%s**), you need " +
                    "to maintain a collective average SGPA of **%s** across your remaining " +
                    "**%d** credits. This is very achievable! Use the 'Grade Simulator' to " +
                    "plan your scores.", targetCgpa, currentCgpa, predictor.requiredSgpa(), remaining);
            }
        }

        // Career branch
        if (lower.contains("career") || lower.contains("web")
                || lower.contains("job") || lower.contains("placement")) {
            if (currentSem <= 2) {
                return "You are in the **Foundation Phase** (Sem 1-2). Stop worrying about " +
                       "placements right now! Focus on C programming basics, HTML elements, " +
                       "and CSS flexbox. Build clean static web pages.";
            } else if (currentSem <= 4) {
                return "You are in the **Core Engineering Phase** (Sem 3-4). Learn React " +
                       "component architectures and bridge OOP (C++) concepts into JS hooks. " +
                       "Start checking standard algorithms (Data Structures).";
            } else if (currentSem <= 6) {
                return "You are in the **Full-Stack Launch Phase** (Sem 5-6). Treat 'Web " +
                       "Technology' as your core subject. Build full-stack MERN projects, " +
                       "commit them to GitHub, and deploy on Vercel.";
            } else {
                return "You are in the **Specialization Phase** (Sem 7-8). Time to package " +
                       "flagship portfolios! Integrate AI APIs (OpenAI/Hugging Face) into your " +
                       "React projects, dockerize servers, and practice coding challenges.";
            }
        }

        // General fallback
        String subjects = activeSubjects.stream().limit(3)
            .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);
        return String.format(
            "I'm analyzing your academic portfolio. Currently in **Semester %d**, with a " +
            "**%s** CGPA, targeting a **%.2f** CGPA. Active subjects include: %s.\n\n" +
            "*Pro-tip: Try asking me for a 'study plan', 'target check', or 'attendance " +
            "status' for a specific breakdown!*",
            currentSem, currentCgpa, targetCgpa, subjects);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private String computeAttendancePct(List<AttendanceLog> logs) {
        if (logs.isEmpty()) return "N/A";
        long present = logs.stream()
            .filter(l -> l.getStatus() == AttendanceLog.AttendanceStatus.Present)
            .count();
        return String.format("%.1f", (present * 100.0) / logs.size());
    }

    private List<String> activeSubjectNames(int semNumber) {
        return SyllabusData.SYLLABUS.stream()
            .filter(s -> s.semester() == semNumber)
            .findFirst()
            .map(s -> s.courses().stream().map(SyllabusData.Course::title).toList())
            .orElse(List.of());
    }
}
