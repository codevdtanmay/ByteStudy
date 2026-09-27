package com.bytepath.controller;

import com.bytepath.dto.request.ExpenseRequest;
import com.bytepath.dto.request.MonthlyBudgetRequest;
import com.bytepath.model.Expense;
import com.bytepath.model.User;
import com.bytepath.service.AcademicService;
import com.bytepath.service.StudentDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for student budget planning and expense logging.
 */
@RestController
@RequestMapping("/api/expenses")
@Tag(name = "Expenses", description = "Student pocket expense tracker")
@SecurityRequirement(name = "Bearer Authentication")
public class ExpenseController {

    private static final Logger log = LoggerFactory.getLogger(ExpenseController.class);

    private final StudentDataService studentDataService;
    private final AcademicService academicService;

    public ExpenseController(StudentDataService studentDataService, AcademicService academicService) {
        this.studentDataService = studentDataService;
        this.academicService = academicService;
    }

    @Operation(summary = "Get all expenses (newest first)")
    @GetMapping
    public ResponseEntity<List<Expense>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(studentDataService.getExpenses(user));
    }

    @Operation(summary = "Create a new expense entry")
    @PostMapping
    public ResponseEntity<Expense> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExpenseRequest request) {
        log.info("Student '{}' creating expense amount={}, category='{}'",
                user.getLoginId(), request.getAmount(), request.getCategory());
        Expense created = studentDataService.createExpense(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an expense entry")
    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        log.info("Student '{}' updating expense id={}", user.getLoginId(), id);
        Expense updated = studentDataService.updateExpense(user, id, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete an expense entry")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        log.info("Student '{}' deleting expense id={}", user.getLoginId(), id);
        studentDataService.deleteExpense(user, id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get current monthly budget")
    @GetMapping("/budget")
    public ResponseEntity<Map<String, Object>> getBudget(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("monthlyBudget", user.getMonthlyBudget()));
    }

    @Operation(summary = "Update monthly budget")
    @PutMapping("/budget")
    public ResponseEntity<Map<String, Object>> updateBudget(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MonthlyBudgetRequest request) {
        log.info("Student '{}' updating monthly budget to {}", user.getLoginId(), request.getMonthlyBudget());
        User updated = academicService.setMonthlyBudget(user, request.getMonthlyBudget());
        return ResponseEntity.ok(Map.of("monthlyBudget", updated.getMonthlyBudget()));
    }
}
