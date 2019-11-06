SELECT json_build_object('crenId', cr."crenId", 'crenName', cr."crenName", 'crenDesc', cr."crenDesc", 'crenStartTime', cr."crenStartTime", 'crenEndTime', cr."crenEndTime", 'conferences', 
    (SELECT json_agg(json_build_object('confname', cf."confname", 'confShortDesc', cf."confShortDesc", 'confMDlink', cf."confMDlink", 'confCrenId', cf."confCrenId", 'confThemeId', cf."confThemeId", 'confId', cf."confId", 'theme', 
		(SELECT json_agg(json_build_object('themeName', th."themeName", 'themeShortDesc', th."themeShortDesc", 'themeDescription', th."themeDescription", 'themeMDlink', th."themeMDlink", 'themeId', th."themeId")) 
		 FROM conferences.thematiques th WHERE th."themeId" = cf."confThemeId"))) 
    FROM conferences."conferencesList" cf WHERE cf."confCrenId" = cr."crenId")) json
FROM conferences.creneaux cr
ORDER BY cr."crenStartTime"