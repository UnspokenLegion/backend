package com.moneysaver.backend.controllers;

import com.moneysaver.backend.models.Category;
import com.moneysaver.backend.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/categories")

public class CategoryController {
    @Autowired
    private CategoryRepository categoryRepository;

    // --- 1. READ (GET) ---
    // Fetches all categories when you visit http://localhost:8080/api/category
    @GetMapping
    public List<Category> getAllCategory() {
        return categoryRepository.findAll();
    }

    // --- 2. WRITE / CREATE (POST) ---
    // Takes incoming JSON data from a frontend and saves it to SQL Server
    @PostMapping
    public Category createCategory(@RequestBody Category newCategory) {
        // The .save() method automatically generates and runs the INSERT SQL query
        return categoryRepository.save(newCategory);
    }

    @DeleteMapping("/{id}")
    public String deleteCategory(@PathVariable Integer id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return "Category with ID " + id + " was successfully deleted!";
        } else {
            return "Error: Category not found.";
        }
    }
}