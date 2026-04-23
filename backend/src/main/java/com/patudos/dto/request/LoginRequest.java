package com.patudos.dto.request;

// Java records são perfeitos para DTOs — imutáveis e sem boilerplate
public record LoginRequest(String email, String password) {}