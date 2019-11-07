INSERT INTO
	conferences.guests(
		"lName",
		"fName",
		company,
		email,
		"position",
		vehicle,
		"hasValidate",
		token,
		conferences
	)
VALUES
	(
		${lName},
		${fName},
		${company},
		${email},
		${position},
		${vehicle},
		${hasValidate},
		${token},
		${conferences}
	);