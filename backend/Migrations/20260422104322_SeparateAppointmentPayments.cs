using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeparateAppointmentPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_paid",
                table: "appointments");

            migrationBuilder.CreateTable(
                name: "appointment_payments",
                columns: table => new
                {
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    mentor_paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payment_code = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("appointment_payments_pkey", x => x.appointment_id);
                    table.ForeignKey(
                        name: "fk_appointment_payments_appointment",
                        column: x => x.appointment_id,
                        principalTable: "appointments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "appointment_payments");

            migrationBuilder.AddColumn<bool>(
                name: "is_paid",
                table: "appointments",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
