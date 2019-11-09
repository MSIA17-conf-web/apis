SELECT json_build_object('confName', cf."confName", 'confShortDesc', cf."confShortDesc", 'confMDlink', cf."confMDlink", 'confCrenId', cf."confCrenId", 'confThemeId', cf."confThemeId", 'confId', cf."confId", 'theme', 
(SELECT json_agg(json_build_object('themeName', th."themeName", 'themeShortDesc', th."themeShortDesc", 'themeDescription', th."themeDescription", 'themeMDlink', th."themeMDlink", 'themeId', th."themeId")) 
FROM conferences.thematiques th WHERE th."themeId" = cf."confThemeId")) json
FROM conferences."conferencesList" cf where cf."confId" = ${confId}