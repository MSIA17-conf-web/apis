UPDATE
     conferences.guests g
SET
     "lName" = ${lName},
     "fName" = ${fName},
     company = ${company},
     email = ${email},
     "position" = ${position},
     vehicle = ${vehicle},
     "hasValidate" = ${hasValidate},
     token = ${token},
     conferences = ${conferences}
WHERE
     g.email = ${email};