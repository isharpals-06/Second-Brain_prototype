---
subject: Object-Oriented Programming Systems (OPPS)
topic: Course Overview
concept: OPPS Map of Content
type: MOC
status: reviewed
tags: [university, opps, index]
created: 2026-06-20
---

# 🗺️ Object-Oriented Programming Systems (OPPS) MOC

Welcome to your Map of Content (MOC) for the OPPS (C/C++ Memory Management and Object-Oriented Programming) course. This index maps all refined concept notes, sorted by topic.

---

## 💾 Unit 1: C Memory Management

This section covers the abstract memory model of C, stack/heap layout, dynamic allocation, common errors, compilation, and profiling tools.

### 1. Core Abstractions & Layout
*   [[Abstract Memory Machine]] - C's byte-array memory abstraction.
*   [[Process Memory Layout]] - Text, data, BSS, stack, and heap organization.
*   [[C Language Fundamentals]] - Core syntax, declaration vs definition, and structural rules.
*   [[Low Level Access and Performance in C]] - Direct hardware mapping, speed advantages, and VM comparison.

### 2. Pointer & Memory Mechanics
*   [[Pointers and Memory Addresses]] - Pointer syntax, address-of/dereference operators, and pass-by-pointer.
*   [[Stack vs Heap Memory]] - Allocation lifecycles, growth directions, and variable scopes.
*   [[Dynamic Memory Allocation in C]] - standard library memory functions (`malloc`, `free`) and dynamic arrays.
*   [[Structures and Dynamic Data Types]] - Struct allocation, member access (`.` vs `->`), singly linked lists, and BST nodes.

### 3. Diagnostics, Compilation & Safety
*   [[Common Memory Errors]] - Segfaults, leaks, out-of-bounds, uninitialized access, double frees, and stack scope escapes.
*   [[Memory Debugging Tools]] - GDB execution control/inspection and Valgrind Memcheck.
*   [[Program Profiling with gprof]] - Generating execution flat profiles and call graphs via the `-pg` flag.
*   [[Integer Overflow and Safe Arithmetic]] - Signed 32-bit limits, wrap-around math, and safe binary search midpoint calculations.
*   [[C Compilation Process]] - Preprocessor, compilation, assembly, and static/dynamic linking.
*   [[C Programming Style and Best Practices]] - Yoda conditions, pre-increment habits, pointer initialization, and allocation overhead.

---

## 🧩 Unit 2: Object-Oriented Programming in C++

This section covers object model abstractions, class declarations, access control, virtual dispatch, inheritance, polymorphism, templates, and copy control.

### 1. C++ Object Fundamentals
*   [[Introduction to OOP in C++]] - Characteristics vs responsibilities, and classes vs instances.
*   [[C++ Class Declaration and Definition]] - Header (`.h`) vs source (`.cpp`) files, scope resolution `::`, and constructor initializer lists.
*   [[C++ Encapsulation and Access Control]] - Access specifiers (`public` vs `private`) and interface/implementation decoupling.
*   [[C++ Object Lifecycle and Memory Management]] - Stack vs heap objects, `new`/`delete` operators, and destructor chaining.
*   [[Representation Invariants and checkRep]] - Valid state constraints, invariant checks, and assertions with `NDEBUG`.

### 2. Inheritance & Runtime Polymorphism
*   [[C++ Class Inheritance]] - Subclassing, base class initialization, and `protected` accessibility.
*   [[C++ Polymorphism and Virtual Functions]] - Declared vs actual types, static/dynamic binding, and VTABLE/vptr internals.
*   [[C++ Virtual Destructors]] - Preventing subclass memory leaks during polymorphic deallocations.
*   [[C++ Type Casting and Downcasting]] - Upcasting, downcasting, `dynamic_cast` runtime checks, and `static_cast` compile-time casts.
*   [[C++ Abstract Base Classes]] - Pure virtual functions (`= 0`), abstract interfaces, and pure virtual destructors.

### 3. Software Design & Code Reuse
*   [[Liskov Substitution Principle]] - Subtyping behavioral contract rules, LSP violations, and the Rectangle-Square design dilemma.
*   [[C++ Namespaces]] - Scope resolution `::`, namespace declarations, using directives/declarations, and standard library pollution rules.
*   [[C++ Standard Template Library]] - STL dynamic containers (`std::vector`), map structures, and traversing via iterators.
*   [[C++ Copy Control and the Rule of Three]] - Copy constructors (why references are needed), copy assignment, shallow vs deep copies, and the Rule of Three.
