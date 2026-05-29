-- CreateEnum
CREATE TYPE "EntregaStatus" AS ENUM ('ATIVA', 'ENCERRADA');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoPor" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "criancas" INTEGER NOT NULL DEFAULT 0,
    "adolescentes" INTEGER NOT NULL DEFAULT 0,
    "adultos" INTEGER NOT NULL DEFAULT 0,
    "idosos" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL,
    "status" "EntregaStatus" NOT NULL DEFAULT 'ATIVA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerradaEm" TIMESTAMP(3),

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retiradas" (
    "id" TEXT NOT NULL,
    "beneficiarioId" TEXT NOT NULL,
    "entregaId" TEXT NOT NULL,
    "retiradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retiradas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiarios_cpf_key" ON "beneficiarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "retiradas_beneficiarioId_entregaId_key" ON "retiradas"("beneficiarioId", "entregaId");

-- AddForeignKey
ALTER TABLE "retiradas" ADD CONSTRAINT "retiradas_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiradas" ADD CONSTRAINT "retiradas_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "entregas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
