FOR /F "delims=" %%s IN (NameList.txt) DO curl https://thispersondoesnotexist.com -o "%%s.jpg"
pause