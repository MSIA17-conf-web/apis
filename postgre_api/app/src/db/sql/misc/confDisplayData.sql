SELECT json_build_object('themeName', th."themeName", 'themeShortDesc', th."themeShortDesc", 'themeDescription', th."themeDescription", 'themeMDlink', th."themeMDlink", 'themeId', th."themeId", 'conferences', 
    (SELECT json_agg(json_build_object('confName', cf."confName", 'confShortDesc', cf."confShortDesc", 'confMDlink', cf."confMDlink", 'confCrenId', cf."confCrenId", 'confThemeId', cf."confThemeId", 'confId', cf."confId", 'creneau', 
        (SELECT json_agg(json_build_object('crenId', cr."crenId", 'crenName', cr."crenName", 'crenDesc', cr."crenDesc", 'crenStartTime', cr."crenStartTime", 'crenEndTime', cr."crenEndTime"))
        FROM conferences.creneaux cr WHERE cr."crenId" = cf."confCrenId")))
    FROM conferences."conferencesList" cf WHERE cf."confThemeId" = th."themeId")) json
FROM conferences.thematiques th
ORDER BY th."themeId";
