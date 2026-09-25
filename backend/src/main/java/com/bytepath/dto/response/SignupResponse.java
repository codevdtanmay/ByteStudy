package com.bytepath.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class SignupResponse {
    private String message;
    private String email;
}
