import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { authService } from "@/service/auth/auth";


const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockLogin = jest.fn();
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: jest.fn(),
    login: mockLogin,
  }),
}));

jest.mock("@/service/auth/auth", () => ({
  authService: {
    signUp: jest.fn(),
  },
}));

// ============================================================
// INTEGRAÇÃO 1: Tela de Cadastro (SignUp)
// ============================================================
describe("Tela de Cadastro (SignUp) - Integração", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir erros de validação ao submeter formulário vazio", async () => {
    const { default: SignUp } = await import("@/app/signup/page");
    render(<SignUp />);

    const buttons = screen.getAllByRole("button", { name: /criar conta/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Senha é obrigatória")).toBeInTheDocument();
    });
  });

  it("deve exibir erro de validação para e-mail inválido", async () => {
    const { default: SignUp } = await import("@/app/signup/page");
    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "emailinvalido" },
    });
    const buttons = screen.getAllByRole("button", { name: /criar conta/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
    });
  });

  it("deve exibir erro quando as senhas não coincidem", async () => {
    const { default: SignUp } = await import("@/app/signup/page");
    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@email.com" },
    });
    const senhaInputs = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(senhaInputs[0], { target: { value: "Senha@1234" } });
    fireEvent.change(senhaInputs[1], { target: { value: "SenhaDiferente@1" } });

    const buttons = screen.getAllByRole("button", { name: /criar conta/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
    });
  });

  it("deve chamar authService.signUp e redirecionar para '/' após cadastro bem-sucedido", async () => {
    // Mock do serviço de autenticação
    (authService.signUp as jest.Mock).mockResolvedValue({
      id: 1,
      email: "usuario@email.com",
    });

    const { default: SignUp } = await import("@/app/signup/page");
    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@email.com" },
    });
    const senhaInputs = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(senhaInputs[0], { target: { value: "Senha@1234" } });
    fireEvent.change(senhaInputs[1], { target: { value: "Senha@1234" } });

    const buttons = screen.getAllByRole("button", { name: /criar conta/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});

// ============================================================
// INTEGRAÇÃO 2: Tela de Login (SignIn)
// ============================================================
describe("Tela de Login (SignIn) - Integração", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir erros de validação ao submeter formulário vazio", async () => {
    const { default: SignIn } = await import("@/app/signin/page");
    render(<SignIn />);

    const buttons = screen.getAllByRole("button", { name: /entrar/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Senha é obrigatória")).toBeInTheDocument();
    });
  });

  it("deve exibir link 'Esqueci minha senha' que redireciona corretamente", async () => {
    const { default: SignIn } = await import("@/app/signin/page");
    render(<SignIn />);

    fireEvent.click(screen.getByText("Esqueci minha senha"));
    expect(mockPush).toHaveBeenCalledWith("/reset-password");
  });

  it("deve exibir link 'Criar conta' que redireciona para a tela de cadastro", async () => {
    const { default: SignIn } = await import("@/app/signin/page");
    render(<SignIn />);

    fireEvent.click(screen.getByText("Criar conta"));
    expect(mockPush).toHaveBeenCalledWith("/signup");
  });

  it("deve exibir mensagem de erro quando as credenciais forem inválidas", async () => {
    const { AxiosError } = await import("axios");
    const axiosError = new AxiosError("Erro");
    axiosError.response = {
      data: { message: "Credenciais inválidas" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {} as never,
    };

    jest.mock("@/service/auth/auth", () => ({
      authService: {
        signIn: jest.fn().mockRejectedValue(axiosError),
      },
    }));

    const { default: SignIn } = await import("@/app/signin/page");
    render(<SignIn />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "SenhaErrada@1" },
    });

    const buttons = screen.getAllByRole("button", { name: /entrar/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    });
  });
});
