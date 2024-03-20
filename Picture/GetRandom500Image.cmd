FOR /L %%i IN (1, 1 500) DO curl https://thispersondoesnotexist.com -o %%i.jpg
pause