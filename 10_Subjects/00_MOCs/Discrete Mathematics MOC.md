---
subject: Discrete Mathematics
topic: Course Overview
concept: Discrete Mathematics Map of Content
type: MOC
status: reviewed
tags: [university, discrete-math, index]
created: 2026-06-20
---

# 🗺️ Discrete Mathematics Map of Content (MOC)

Welcome to your Map of Content (MOC) for the Discrete Mathematics & Principles of Discrete Applied Mathematics course. This index organizes all concepts, theorems, algorithms, and active recall resources.

---

## 🏛️ Unit 1: Combinatorics & Proof Techniques

This section covers core combinatorial principles, counting arguments, and standard proof techniques.

*   **Pigeonhole Principle & Applications**:
    *   [[Pigeonhole Principle]] - Definition, ceiling/floor bounds, and graph/subset sum proofs.
    *   [[Erdos-Szekeres Theorem]] - Monotone subsequences in sequences of distinct real numbers.
*   **Combinatorial Counting**:
    *   [[Combinatorial Counting Principles]] - Permutations, combinations, multinomial coefficients, stars and bars, and partitions.
    *   [[Double Counting]] - Proving identities (Pascal, subset sums) by counting from two perspectives.
    *   [[Stirlings Approximation]] - Asymptotic factorial growth, middle binomial coefficients, and Catalan growth.
*   **Catalan Numbers & Recurrences**:
    *   [[Catalan Numbers and Families]] - Catalan numbers, Dyck paths, plane trees, binary trees, bijections, and reflection principle.
    *   [[Generating Functions Definition and Operations]] - Formal power series, disjoint union, Cartesian product, and Seq operators.
    *   [[Generating Functions for Giving Change]] - Modeling supply of coins (finite/infinite) using polynomial multiplication.
    *   [[Generating Functions for Recurrences]] - Shift method, Binet's formula via partial fractions, and order-$k$ recurrences.
    *   [[Catalan Numbers via Generating Functions]] - Solving quadratic generating functions $xG^2 - G + 1 = 0$ using binomial theorem.
    *   [[Pascal Triangle Diagonals]] - Diagonal summation $\sum \binom{m+j}{2j} = f_{2m}$ using two-variable generating functions.

---

## 🧩 Unit 2: Graph Theory

This section covers graph structures, trees, network flows, and matching algorithms.

*   **Trees & Connectivity**:
    *   [[Cayley Theorem Labeled Trees]] - Labeled tree counts ($n^{n-2}$) and Jim Pitman's double-counting proof.
*   **Network Flows & Matchings**:
    *   [[Maximum Flow Problem]] - Formal definition, flow conservation, capacity bounds, and LP formulation.
    *   [[Max-Flow Min-Cut Theorem]] - Weak duality, LP duality dual representation, and randomized rounding proof.
    *   [[Ford-Fulkerson Algorithm]] - Residual graphs, augmenting paths, integrality theorem, and correctness proof.
    *   [[Bipartite Matching and Konig Theorem]] - Flow formulation, matchings, vertex covers, and König's theorem proof.
    *   [[Halls Marriage Theorem]] - Neighborhood condition $|\Gamma(R)| \ge |R|$ and flow-based sufficiency proof.

---

## 🔢 Unit 3: Number Theory, Algebra & Cryptography

This section covers modular arithmetic, abstract algebra, probability bounds, information theory, and cryptographic protocols.

*   **Algebraic Structures & Modulo Groups**:
    *   [[Group Theory Basics]] - Group axioms, Abelian groups, subgroups, left/right cosets, and Lagrange's Theorem.
    *   [[Modular Arithmetic and Groups]] - Congruences, equivalence classes, additive groups $\mathbb{Z}_m$, and multiplicative groups $\mathbb{Z}^*_m$.
    *   [[Euclidean Algorithm and Bezout Identity]] - Standard gcd algorithm, Extended Euclidean algorithm, and modular inverse.
    *   [[Chinese Remainder Theorem]] - Pairwise coprime moduli bijection, reconstruction formula, and roots of $x^2 \equiv 1 \pmod N$.
    *   [[Fermats Little Theorem and Eulers Totient]] - Euler's totient function $\phi(N)$, Fermat's Little Theorem, and Euler's Theorem.
    *   [[Fields and Polynomial Roots]] - Field axioms, $\mathbb{Z}_p$, zero divisors, and degree-$d$ polynomials having at most $d$ roots.
*   **Probability & Tail Bounds**:
    *   [[Discrete Probability Space and Events]] - Sample spaces, probability axioms, uniform distributions, and set operations.
    *   [[Conditional Probability and Independence]] - $\mathbb{P}(B|A)$, Law of Total Probability, mutual/pairwise independence, and product distribution.
    *   [[Bayes Rule]] - Formula, prior/posterior updates, and medical testing false positive application.
    *   [[Inclusion-Exclusion Principle]] - Union formulas for 2, 3, and $n$ events, induction proof, and derangements (envelopes).
    *   [[Mathematical Expectation]] - Definition, linearity of expectation (independent or dependent), and indicator variables.
    *   [[Variance and Covariance]] - Computational formula, properties, pairwise independent sums, and Cauchy-Schwarz bound.
    *   [[Markov and Chebyshev Inequalities]] - Markov (non-negative tail), Chebyshev (variance-based deviation), and proofs.
    *   [[Weak Law of Large Numbers]] - Convergence in probability of sample averages, proof via Chebyshev, and pairwise independence.
    *   [[Chernoff Bound]] - Exponentiated tail bounds for Bernoulli trials, proof, and success probability boosting (primality).
    *   [[Moment Generating Function]] - $\mathbb{E}[e^{sX}]$, relation to moments (derivatives at $0$), and product of independent sums.
*   **Information Theory & Coding**:
    *   [[Coding Basics and Lower Bounds]] - Coding functions, minimax expected length, permutation coding, and Dyck path coding.
    *   [[Information Entropy]] - Definition of $H(p)$, unit of bits, non-negativity, and maximality under uniform distribution.
    *   [[Shannons Noiseless Coding Theorem]] - Source coding bounds, typical sequences, Stirling approximations, and typical coding.
    *   [[Prefix Codes and Krafts Inequality]] - Prefix-free condition, tree representation, and Kraft's inequality proof.
    *   [[Huffman Coding]] - Greedy algorithm, prefix tree construction, and step-by-step trace example.
    *   [[Huffman Code Bounds]] - $H(p) \le L \le H(p) + 1$, block coding $A^k$, and asymptotic convergence to entropy.
    *   [[Binary Symmetric Channel and Repetition Codes]] - BSC transitions, repetition codes, majority voting, and log-overhead inefficiency.
    *   [[Noisy Channel Coding Theorem]] - Rate, capacity $C=1-H(p)$, theorem statement, and sphere-packing geometric volume packing.
    *   [[Shannon Noisy Proof and Pruning]] - Typical set decoding, random codebook average error, and worst-half pruning derandomization.
*   **Linear Error-Correcting Codes**:
    *   [[Linear Error-Correcting Codes]] - Message/codeword spaces, generator matrix $G$, systematic form, and weight-distance equivalence.
    *   [[Parity-Check Matrix and Syndrome Decoding]] - Dual representation $H$, relation to $G$, $GH=0$, syndrome definition, and single-error location.
    *   [[Hamming Codes]] - Row requirements for $H$, $[2^m-1, 2^m-1-m]$ parameters, (7,4) Hamming code, and perfect codes.
    *   [[Reed-Solomon Codes]] - Polynomial evaluation, Vandermonde generator matrix, MDS property, and error-locator decoding.
    *   [[Difference Operators and Polynomial Reconstruction]] - Operator $\Delta$, vanishing differences, and Newton's interpolation formula.
    *   [[Berlekamp-Welch Algorithm]] - Key relation $q(i) = r_i f(i)$, solving using difference operators, and trace example over $\mathbb{Z}_7$.
*   **Cryptography & Sharing**:
    *   [[Introduction to Cryptography]] - Symmetric/asymmetric ciphers, Caesar/substitution ciphers, and public-key trapdoors.
    *   [[The RSA Cryptosystem]] - Modulus $N=pq$, public/private key generation, encryption/decryption, and correctness proof.
    *   [[Modular Exponentiation]] - Repeated squaring algorithm, $O(\log e)$ time complexity, and step-by-step example.
    *   [[RSA Digital Signatures]] - Private key encryption, public key verification, and security guarantees.
    *   [[Lagrange Interpolation]] - Formula, basis polynomials, and uniqueness proof.
    *   [[Shamirs Secret Sharing Scheme]] - $(k,n)$ threshold scheme, polynomial share generation, Lagrange reconstruction, and security proof.
