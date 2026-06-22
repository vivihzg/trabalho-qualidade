import { test, expect } from '@playwright/test';

test('E2E - Teste de criação de conta erro de e-mail', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');

  await page.getByRole('textbox', { name: 'seu@email.com' }).click();
  await page.getByRole('textbox', { name: 'seu@email.com' }).fill('teste@gmail');


  await page.getByRole('textbox', { name: '••••••••' }).first().click();
  await page.getByRole('textbox', { name: '••••••••' }).first().fill('Senha@1234');

  await page.getByRole('textbox', { name: '••••••••' }).nth(1).click();
  await page.getByRole('textbox', { name: '••••••••' }).nth(1).fill('Senha@1234');

  await page.getByRole('main').getByRole('button', { name: 'Criar Conta' }).click();

  await expect(page.getByText('Email inválido')).toBeVisible();
});

test('E2E - Verificando erros de formulário não preenchido', async ({page}) => {
  await page.goto('http://localhost:3000/signup');

  await page.getByRole('main').getByRole('button', { name: 'Criar Conta' }).click();

  await expect(page.getByText('Email é obrigatório', { exact: true })).toBeVisible();
  await expect(page.getByText('Senha é obrigatória', { exact: true })).toBeVisible();
  await expect(page.getByText('Confirmação de senha é obrigatória', { exact: true })).toBeVisible();
});

test('API - cadastro com sucesso', async ({ request }) => {
  const response = await request.post('http://localhost:8080/auth/signup', {
    data: {
      email: `testebb@gmail.com`,
      password: 'Senha@1234'
    }
  });
  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body).toHaveProperty('id');
  expect(body).toHaveProperty('email');
  console.log(body);
});

test('API - email duplicado', async ({ request }) => {

  const response = await request.post('http://localhost:8080/auth/signup', {
    data: { email: `testeapi2@gmail.com`, password: 'Senha@1234' }
  });

  expect(response.status()).toBe(409);

  const body = await response.json();
  expect(body.message).toContain('E-mail já está em uso');
  console.log(body);
});

test('API - login inválido', async ({ request }) => {
  const response = await request.post('http://localhost:8080/auth/signin', {
    data: {
      email: 'naoexiste@gmail.com',
      password: 'errada123'
    }
  });

  expect(response.status()).toBe(422);

  const body = await response.json();
  expect(body.message).toContain('Senha inválida');
});

test('API - buscar posts', async ({ request }) => {
  const response = await request.get('http://localhost:8080/posts');

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body).toHaveProperty('posts');
  expect(Array.isArray(body.posts)).toBe(true);

  expect(body.posts.length).toBeGreaterThan(0);

  expect(body.posts[0]).toHaveProperty('title');
  expect(body.posts[0]).toHaveProperty('body');
  console.log(body);
});
