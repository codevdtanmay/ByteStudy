package com.bytepath.service;

import com.bytepath.model.*;
import com.bytepath.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;
import com.bytepath.dto.request.PyqUploadInitRequest;
import com.bytepath.dto.response.PyqAccessResponse;
import com.bytepath.dto.response.PyqUploadInitResponse;

/**
 * Generic CRUD services for Deadlines, Expenses, Focus Sessions,
 * Simulated Grades, and PYQ Resources.
 */
@Service
public class StudentDataService {

    private final DeadlineRepository      deadlineRepo;
    private final ExpenseRepository       expenseRepo;
    private final FocusSessionRepository  focusRepo;
    private final SimulatedGradeRepository simGradeRepo;
    private final PyqResourceRepository   pyqRepo;
    private final SupabaseStorageService   storage;
    private final SubscriptionRepository   subscriptionRepo;
    private final ResourceAccessLogRepository accessLogRepo;
    private final DocumentProcessingService documentProcessing;
    private final DocumentSearchService documentSearch;

    public StudentDataService(
            DeadlineRepository deadlineRepo,
            ExpenseRepository expenseRepo,
            FocusSessionRepository focusRepo,
            SimulatedGradeRepository simGradeRepo,
            PyqResourceRepository pyqRepo,
            SupabaseStorageService storage,
            SubscriptionRepository subscriptionRepo,
            ResourceAccessLogRepository accessLogRepo,
            DocumentProcessingService documentProcessing,
            DocumentSearchService documentSearch) {
        this.deadlineRepo  = deadlineRepo;
        this.expenseRepo   = expenseRepo;
        this.focusRepo     = focusRepo;
        this.simGradeRepo  = simGradeRepo;
        this.pyqRepo       = pyqRepo;
        this.storage       = storage;
        this.subscriptionRepo = subscriptionRepo;
        this.accessLogRepo = accessLogRepo;
        this.documentProcessing = documentProcessing;
        this.documentSearch = documentSearch;
    }

    // ── Deadlines ──────────────────────────────────────────────────────────────

    public List<Deadline> getDeadlines(User user) {
        return deadlineRepo.findByUserOrderByDueDateAsc(user);
    }

    @Transactional
    public Deadline createDeadline(User user, Deadline d) {
        d.setUser(user);
        return deadlineRepo.save(d);
    }

    @Transactional
    public Deadline updateDeadline(User user, Long id, Deadline updated) {
        Deadline existing = deadlineRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Deadline not found: " + id));
        assertOwner(user, existing.getUser());
        existing.setTitle(updated.getTitle());
        existing.setDueDate(updated.getDueDate());
        existing.setCategory(updated.getCategory());
        existing.setPriority(updated.getPriority());
        existing.setStatus(updated.getStatus());
        return deadlineRepo.save(existing);
    }

    @Transactional
    public void deleteDeadline(User user, Long id) {
        Deadline d = deadlineRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Deadline not found: " + id));
        assertOwner(user, d.getUser());
        deadlineRepo.delete(d);
    }

    // ── Expenses ───────────────────────────────────────────────────────────────

    public List<Expense> getExpenses(User user) {
        return expenseRepo.findByUserOrderByDateDesc(user);
    }

    @Transactional
    public Expense createExpense(User user, Expense e) {
        e.setUser(user);
        return expenseRepo.save(e);
    }

    @Transactional
    public Expense updateExpense(User user, Long id, Expense updated) {
        Expense existing = expenseRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Expense not found: " + id));
        assertOwner(user, existing.getUser());
        existing.setAmount(updated.getAmount());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setDate(updated.getDate());
        return expenseRepo.save(existing);
    }

    @Transactional
    public void deleteExpense(User user, Long id) {
        Expense e = expenseRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Expense not found: " + id));
        assertOwner(user, e.getUser());
        expenseRepo.delete(e);
    }

    // ── Focus Sessions ─────────────────────────────────────────────────────────

    public List<FocusSession> getFocusSessions(User user) {
        return focusRepo.findByUserOrderByDateDescStartTimeDesc(user);
    }

    @Transactional
    public FocusSession createFocusSession(User user, FocusSession session) {
        session.setUser(user);
        return focusRepo.save(session);
    }

    @Transactional
    public void deleteFocusSession(User user, Long id) {
        FocusSession s = focusRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Focus session not found: " + id));
        assertOwner(user, s.getUser());
        focusRepo.delete(s);
    }

    // ── Simulated Grades ───────────────────────────────────────────────────────

    public List<SimulatedGrade> getSimulatedGrades(User user) {
        return simGradeRepo.findByUser(user);
    }

    @Transactional
    public SimulatedGrade setSimulatedGrade(User user, String courseCode, String grade) {
        SimulatedGrade sg = simGradeRepo.findByUserAndCourseCode(user, courseCode)
            .orElseGet(() -> SimulatedGrade.builder().user(user).courseCode(courseCode).build());
        sg.setGrade(grade);
        return simGradeRepo.save(sg);
    }

    @Transactional
    public void clearSimulatedGrades(User user) {
        simGradeRepo.deleteByUser(user);
    }

    // ── PYQ Resources (admin-managed) ──────────────────────────────────────────

    public List<PyqResource> getAllPyqs() {
        return pyqRepo.findAllByOrderByUploadedAtDesc();
    }

    public List<PyqResource> getPyqsBySemester(int semesterNumber) {
        return pyqRepo.findBySemesterNumber(semesterNumber);
    }

    public PyqResource findPyq(Long id) { return pyqRepo.findById(id).orElseThrow(() -> new NoSuchElementException("PYQ resource not found: " + id)); }

    @Transactional
    public PyqResource createPyq(PyqResource pyq) {
        return pyqRepo.save(pyq);
    }

    @Transactional
    public void deletePyq(Long id) {
        PyqResource resource = pyqRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("PYQ resource not found: " + id));
        if (resource.getObjectKey() != null && storage.isConfigured()) {
            try {
                storage.delete(resource.getObjectKey());
            } catch (RuntimeException ignored) {
                // The database record must still be removable if an old storage object
                // was already deleted or the provider cannot find it.
            }
        }
        accessLogRepo.deleteByResource(resource);
        pyqRepo.deleteById(id);
    }

    @Transactional
    public PyqUploadInitResponse initPyqUpload(User admin, PyqUploadInitRequest request) {
        if (admin.getRole() != User.Role.ADMIN) throw new SecurityException("Admin access required.");
        if (!storage.isConfigured()) throw new IllegalStateException("Supabase Storage is not configured on the backend.");
        Set<String> allowedTypes = Set.of("application/pdf", "image/jpeg", "image/png", "image/webp",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        if (!allowedTypes.contains(request.mimeType().toLowerCase())) {
            throw new IllegalArgumentException("Only PDF, JPEG, PNG, WEBP, and DOCX files are supported.");
        }

        String objectKey = "resources/" + UUID.randomUUID() + extensionOf(request.originalFilename());
        PyqResource resource = PyqResource.builder()
            .title(request.title().trim())
            .semesterNumber(request.semesterNumber())
            .courseCode(request.courseCode().trim())
            .examType(request.examType() == null ? "GENERAL" : request.examType())
            .examYear(request.examYear())
            .accessLevel("MID_SEM".equals(request.examType()) || "SYLLABUS".equals(request.examType()) || "NOTES".equals(request.examType()) ? "FREE" : "SUBSCRIPTION")
            .originalFilename(request.originalFilename().trim())
            .mimeType(request.mimeType().toLowerCase())
            .sizeBytes(request.sizeBytes())
            .objectKey(objectKey)
            .status("PENDING")
            .createdBy(admin)
            .build();
        resource = pyqRepo.save(resource);
        return new PyqUploadInitResponse(resource.getId(), objectKey,
            "/pyqs/" + resource.getId() + "/upload", 600);
    }

    public void uploadPyq(User admin, Long id, org.springframework.web.multipart.MultipartFile file) {
        if (admin.getRole() != User.Role.ADMIN) throw new SecurityException("Admin access required.");
        PyqResource resource = pyqRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("PYQ resource not found: " + id));
        if (resource.getCreatedBy() == null || !admin.getId().equals(resource.getCreatedBy().getId())) {
            throw new SecurityException("You cannot upload this resource.");
        }
        if (file.isEmpty() || file.getSize() > 50L * 1024 * 1024) {
            throw new IllegalArgumentException("The uploaded file must be between 1 byte and 50MB.");
        }
        storage.upload(resource.getObjectKey(), file, resource.getMimeType());
    }

    @Transactional
    public PyqResource completePyqUpload(User admin, Long id) {
        if (admin.getRole() != User.Role.ADMIN) throw new SecurityException("Admin access required.");
        PyqResource resource = pyqRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("PYQ resource not found: " + id));
        if (resource.getCreatedBy() == null || !admin.getId().equals(resource.getCreatedBy().getId())) {
            throw new SecurityException("You cannot complete this upload.");
        }
        var head = storage.head(resource.getObjectKey());
        if (head.contentLength() > 50L * 1024 * 1024) {
            throw new IllegalArgumentException("The uploaded file exceeds the 50MB limit.");
        }
        resource.setSizeBytes(head.contentLength());
        if ("application/pdf".equalsIgnoreCase(resource.getMimeType())) {
            resource.setOcrText(documentProcessing.extractTextOrOcr(storage.getObjectBytes(resource.getObjectKey())));
            documentSearch.index(resource, resource.getOcrText());
        }
        resource.setStatus("READY");
        return pyqRepo.save(resource);
    }

    @Transactional
    public PyqAccessResponse createPyqAccess(User user, Long id, String ipAddress, String userAgent) {
        PyqResource resource = pyqRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("PYQ resource not found: " + id));
        boolean allowed = user.getRole() == User.Role.ADMIN || "FREE".equalsIgnoreCase(resource.getAccessLevel()) || user.isHasEndSemSubscription()
            || subscriptionRepo.findByUserOrderByCreatedAtDesc(user).stream()
                .anyMatch(subscription -> subscription.isActive(java.time.Instant.now()));
        if (!allowed) throw new SecurityException("An active subscription is required to access this resource.");
        if (!"READY".equals(resource.getStatus()) || resource.getObjectKey() == null) {
            throw new IllegalArgumentException("This resource is not ready yet.");
        }
        String watermark = user.getLoginId() + " | " + user.getEmail();
        accessLogRepo.save(ResourceAccessLog.builder().resource(resource).user(user)
            .accessedAt(java.time.Instant.now()).ipAddress(ipAddress).userAgent(userAgent)
            .watermark(watermark).build());
        return new PyqAccessResponse(resource.getId(),
            "/pyqs/" + resource.getId() + "/view", 120);
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        String extension = filename.substring(dot).toLowerCase();
        return extension.matches("\\.(pdf|jpg|jpeg|png|webp|docx)") ? extension : "";
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private void assertOwner(User requester, User owner) {
        if (!requester.getId().equals(owner.getId())) {
            throw new SecurityException("Access denied: you do not own this resource.");
        }
    }
}
