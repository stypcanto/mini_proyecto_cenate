INSERT INTO dim_personal_prof (id_pers, id_prof)
VALUES (1, 1)  -- 1 = id_pers (STYP), 1 = id_prof (MÉDICO)
ON CONFLICT DO NOTHING;

UPDATE dim_especialidad
SET id_pers = 1
WHERE id_esp = 2;


SELECT
    p.id_pers,
    p.nom_pers,
    pr.desc_prof AS profesion,
    e.desc_esp AS especialidad
FROM dim_personal_cnt p
LEFT JOIN dim_personal_prof pp ON pp.id_pers = p.id_pers
LEFT JOIN dim_profesiones pr ON pr.id_prof = pp.id_prof
LEFT JOIN dim_especialidad e ON e.id_pers = p.id_pers
WHERE p.id_pers = 1;


UPDATE dim_personal_prof
SET rne_especialista = '14257'
WHERE id_pers = 1;

