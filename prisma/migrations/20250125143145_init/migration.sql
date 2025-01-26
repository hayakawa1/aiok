-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "google_id" TEXT NOT NULL,
    "stripe_account_id" TEXT,
    "bio" TEXT,
    "portfolio_url" TEXT,
    "avatar_url" TEXT,
    "banner_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "receiver_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "plan_title" TEXT,
    "plan_description" TEXT,
    "delivered_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "file_path" TEXT,
    "delivery_url" TEXT,
    "delivery_comment" TEXT,
    "creation_ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_plans" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_user_request_stats" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_user_request_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "total_user_request_stats" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "first_occurrence" TIMESTAMP(3) NOT NULL,
    "last_occurrence" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "total_user_request_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_user_request_stats_date_user_id_role_status_key" ON "daily_user_request_stats"("date", "user_id", "role", "status");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_plans" ADD CONSTRAINT "price_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_user_request_stats" ADD CONSTRAINT "daily_user_request_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "total_user_request_stats" ADD CONSTRAINT "total_user_request_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
