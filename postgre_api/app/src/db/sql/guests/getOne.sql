SELECT
    *
FROM
    conferences.guests g
WHERE
    LOWER(g.email) = LOWER(${email});