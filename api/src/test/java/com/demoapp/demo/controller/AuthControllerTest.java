package com.demoapp.demo.controller;

import com.demoapp.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    // =========================================================
    // TESTE DE SUCESSO 1: Cadastro com dados válidos
    // =========================================================
    @Test
    @DisplayName("Sucesso: Deve cadastrar um novo usuário com e-mail e senha válidos")
    void signup_comDadosValidos_deveRetornar200() throws Exception {
        var body = Map.of(
            "email", "usuario@email.com",
            "password", "Senha@123"
        );

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("usuario@email.com"))
            .andExpect(jsonPath("$.id").exists());
    }

    // =========================================================
    // TESTE DE SUCESSO 2: Login com credenciais corretas
    // =========================================================
    @Test
    @DisplayName("Sucesso: Deve autenticar um usuário com credenciais corretas")
    void signin_comCredenciaisCorretas_deveRetornar200() throws Exception {
        var signupBody = Map.of(
            "email", "login@email.com",
            "password", "Senha@123"
        );
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupBody)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("login@email.com"))
            .andExpect(jsonPath("$.id").exists());
    }

    // =========================================================
    // TESTE DE BUG: Mensagem de e-mail duplicado incorreta
    // =========================================================
    @Test
    @DisplayName("BUG: Mensagem de e-mail duplicado deve ser 'E-mail já cadastrado' (este teste falha)")
    void signup_comEmailDuplicado_deveMostrarMensagemCorreta() throws Exception {
        var body = Map.of(
            "email", "duplicado@email.com",
            "password", "Senha@123"
        );

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isConflict())

            .andExpect(jsonPath("$.message").value("E-mail já cadastrado"));
    }
}
