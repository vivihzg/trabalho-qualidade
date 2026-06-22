import { isEmailValid, getEmailValidationMessage } from "@/utils/email";
import { isPasswordValid, getPasswordValidationMessage } from "@/utils/password";

// ============================================================
// TESTE UNITÁRIO 1: Funções de validação de e-mail
// ============================================================
describe("isEmailValid", () => {
  it("deve retornar true para um e-mail válido", () => {
    expect(isEmailValid("usuario@email.com")).toBe(true);
  });

  it("deve retornar false para e-mail sem @", () => {
    expect(isEmailValid("usuarioemail.com")).toBe(false);
  });

  it("deve retornar false para e-mail vazio", () => {
    expect(isEmailValid("")).toBe(false);
  });

  it("deve retornar false para e-mail sem domínio", () => {
    expect(isEmailValid("usuario@")).toBe(false);
  });
});

describe("getEmailValidationMessage", () => {
  it("deve retornar mensagem de obrigatório quando e-mail estiver vazio", () => {
    expect(getEmailValidationMessage("")).toBe("Email é obrigatório");
  });

  it("deve retornar string vazia para e-mail válido", () => {
    expect(getEmailValidationMessage("usuario@email.com")).toBe("");
  });
});

// ============================================================
// TESTE UNITÁRIO 2: Funções de validação de senha
// ============================================================
describe("isPasswordValid", () => {
  it("deve retornar true para senha que atende todos os critérios", () => {
    expect(isPasswordValid("Senha@123")).toBe(true);
  });

  it("deve retornar false para senha sem letra maiúscula", () => {
    expect(isPasswordValid("senha@123")).toBe(false);
  });

  it("deve retornar false para senha sem número", () => {
    expect(isPasswordValid("Senha@abc")).toBe(false);
  });

  it("deve retornar false para senha sem caractere especial", () => {
    expect(isPasswordValid("Senha1234")).toBe(false);
  });

  it("deve retornar false para senha vazia", () => {
    expect(isPasswordValid("")).toBe(false);
  });

  it("deve retornar true para senha com exatamente 8 caracteres válidos", () => {
    expect(isPasswordValid("S3nh@123")).toBe(true);
  });
});

describe("getPasswordValidationMessage", () => {
  it("deve retornar string vazia para senha válida", () => {
    expect(getPasswordValidationMessage("Senha@1234")).toBe("");
  });

  it("deve mencionar 'mínimo de 8 caracteres' quando a senha for curta demais", () => {
    const msg = getPasswordValidationMessage("Ab@1");
    expect(msg).toContain("mínimo de 8 caracteres");
  });

  it("deve retornar mensagem de obrigatório quando senha estiver vazia", () => {
    expect(getPasswordValidationMessage("")).toBe("Senha é obrigatória");
  });
});
