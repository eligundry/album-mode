attach '/Users/eligundry/Code/album-mode/prisma/dev.db' as prisma;

insert into SpotifyGenres (name)
select name from prisma.SpotifyGenre order by prisma.SpotifyGenre.id asc;
