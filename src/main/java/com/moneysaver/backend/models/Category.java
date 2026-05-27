package com.moneysaver.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "Category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Type", nullable = false) // 'Income' or 'Expense'
    private String type;

    @Column(name = "IsGlobal", nullable = false)
    private Boolean isGlobal;

    // This is how JPA handles the Foreign Key connection!
    @ManyToOne
    @JoinColumn(name = "User_ID")
    private User user;

    public Category() {}

    // --- Getters and Setters ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getIsGlobal() { return isGlobal; }
    public void setIsGlobal(Boolean isGlobal) { this.isGlobal = isGlobal; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}