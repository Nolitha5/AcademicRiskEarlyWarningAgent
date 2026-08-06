# Supabase Migrations

These migrations have already been applied to the Supabase project
(votvcqlnevzjcedtljhi – Academic Risk Early Warning Agent).

| # | Migration | Description |
|---|-----------|-------------|
| 01 | create_core_tables | students, modules, risk_rules |
| 02 | create_academic_tables | student_marks, attendance, lms_activity |
| 03 | create_support_tables | submissions, tutor_support, engagement, interventions, risk_reports |
| 04 | rls_policies | Row Level Security for all tables |
| 05 | updated_at_triggers | Auto-update timestamp triggers |
| 06 | seed_risk_rules | 10 configurable risk evaluation rules |
| 07 | seed_modules | 20 TUT modules across ICT, Engineering, Business |
| 08 | seed_students | 15 realistic TUT students with mixed risk profiles |
| 09 | seed_marks_attendance | Academic marks for all students |
| 10 | seed_attendance_lms | Attendance records & LMS activity |
| 11 | seed_submissions_tutor_engagement_interventions | All remaining seed data |
| 12 | useful_views | 4 database views for backend queries |

## Views available
- `v_student_mark_summary` – average mark % per student
- `v_student_attendance_summary` – attendance % per student
- `v_student_lms_summary` – avg LMS logins per week
- `v_risk_dashboard` – latest risk report per student (admin dashboard)
