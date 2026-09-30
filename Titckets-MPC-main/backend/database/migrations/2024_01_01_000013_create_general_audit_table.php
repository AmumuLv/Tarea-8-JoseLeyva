<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('general_audit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('rol')->nullable();
            $table->string('area')->nullable();
            $table->string('accion');
            $table->string('modelo')->nullable();
            $table->unsignedBigInteger('modelo_id')->nullable();
            $table->text('descripcion')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['modelo', 'modelo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('general_audit');
    }
};
