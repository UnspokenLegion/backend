package com.moneysaver.backend.controllers;

import com.moneysaver.backend.models.Transaction;
import com.moneysaver.backend.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/transactions") // The base URL for these actions
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    // --- 1. READ (GET) ---
    // Fetches all transactions when you visit http://localhost:8080/api/transactions
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // --- 2. WRITE / CREATE (POST) ---
    // Takes incoming JSON data from a frontend and saves it to SQL Server
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction newTransaction) {
        // The .save() method automatically generates and runs the INSERT SQL query
        return transactionRepository.save(newTransaction);
    }

    // --- 3. DELETE (DELETE) ---
    // Deletes a transaction based on the ID passed in the URL
    @DeleteMapping("/{id}")
    public String deleteTransaction(@PathVariable Integer id) {
        if (transactionRepository.existsById(id)) {
            transactionRepository.deleteById(id);
            return "Transaction with ID " + id + " was successfully deleted!";
        } else {
            return "Error: Transaction not found.";
        }
    }
}