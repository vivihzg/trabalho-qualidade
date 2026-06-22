import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseAuth = jest.fn();
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// ============================================================
// TESTE UNITÁRIO DE COMPONENTE 1: Header
// ============================================================
describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir o título 'SQA Social Media'", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, logout: jest.fn() });
    const { default: Header } = await import("@/components/Header");
    render(<Header />);
    expect(screen.getByText("SQA Social Media")).toBeInTheDocument();
  });

  it("deve exibir botões 'Entrar' e 'Criar Conta' para usuário deslogado", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, logout: jest.fn() });
    const { default: Header } = await import("@/components/Header");
    render(<Header />);
    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.getByText("Criar Conta")).toBeInTheDocument();
  });

  it("deve exibir botões 'Posts Curtidos' e 'Sair' para usuário logado", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, logout: jest.fn() });
    const { default: Header } = await import("@/components/Header");
    render(<Header />);
    expect(screen.getByText("Posts Curtidos")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("deve redirecionar para '/' ao clicar no título", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, logout: jest.fn() });
    const { default: Header } = await import("@/components/Header");
    render(<Header />);
    fireEvent.click(screen.getByText("SQA Social Media"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});

// ============================================================
// TESTE UNITÁRIO DE COMPONENTE 2: PostCard
// ============================================================
describe("PostCard", () => {
  const mockPost = {
    id: 1,
    title: "Título de Teste",
    body: "Corpo do post de teste",
    liked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o título e o corpo do post", async () => {
    const { default: PostCard } = await import("@/components/PostCard");
    render(
      <PostCard
        post={mockPost}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );
    expect(screen.getByText("Título de Teste")).toBeInTheDocument();
    expect(screen.getByText("Corpo do post de teste")).toBeInTheDocument();
  });

  it("deve exibir o botão 'Curtir' quando o post não está curtido", async () => {
    const { default: PostCard } = await import("@/components/PostCard");
    render(
      <PostCard
        post={mockPost}
        isAuthenticated={true}
        onLike={jest.fn()}
      />
    );
    expect(screen.getByText("Curtir")).toBeInTheDocument();
  });

  it("deve exibir alert ao clicar em 'Curtir' sem estar autenticado", async () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const { default: PostCard } = await import("@/components/PostCard");
    render(
      <PostCard
        post={mockPost}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Curtir"));
    expect(alertMock).toHaveBeenCalledWith(
      "Você precisa estar autenticado para curtir posts!"
    );
    alertMock.mockRestore();
  });

  it("deve chamar onLike com o id do post ao clicar em 'Curtir' autenticado", async () => {
    const onLikeMock = jest.fn().mockResolvedValue(undefined);
    const { default: PostCard } = await import("@/components/PostCard");
    render(
      <PostCard
        post={mockPost}
        isAuthenticated={true}
        onLike={onLikeMock}
      />
    );
    fireEvent.click(screen.getByText("Curtir"));
    expect(onLikeMock).toHaveBeenCalledWith(1);
  });
});
