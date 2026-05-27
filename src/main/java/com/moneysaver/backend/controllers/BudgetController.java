package com.moneysaver.backend.controllers;

import com.moneysaver.backend.models.Budget;
import com.moneysaver.backend.repositories.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")// The base URL for these actions
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    // --- 1. READ (GET) ---
    @GetMapping
    public List<Budget> getAllBudget() {
        return budgetRepository.findAll();
    }

    // --- 2. WRITE / CREATE (POST) ---
    // Takes incoming JSON data from a frontend and saves it to SQL Server
    @PostMapping
    public Budget createBudget(@RequestBody Budget newBudget) {
        // The .save() method automatically generates and runs the INSERT SQL query
        return budgetRepository.save(newBudget);
    }

    // --- 3. DELETE (DELETE) ---
    @DeleteMapping("/{id}")
    public String deleteBudget(@PathVariable Integer id) {
        if (budgetRepository.existsById(id)) {
            budgetRepository.deleteById(id);
            return "Budget with ID " + id + " was successfully deleted!";
        } else {
            return "Error: Budget not found.";
        }
    }
}