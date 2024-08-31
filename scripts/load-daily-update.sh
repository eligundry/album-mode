#! /bin/bash

source .env

filename="$1"
local_database_name=".data/new-data.db"

sqlite3 "$local_database_name" <<SQL
-- Import the CSV to a new table to stage the changes
drop table if exists daily_update;
.import $1 daily_update --csv

-- Load rows into local database
insert into ReviewedItems (reviewerID, list, reviewURL, name, creator, service, score, metadata)
select
  Reviewers.id as reviewerID,
  daily_update.list,
  case (select count(*) from daily_update repeats where repeats.reviewURL = daily_update.reviewURL)
    when 1 then daily_update.reviewURL
    else daily_update.reviewURL || '#:~:text=' || daily_update.name
  end as reviewURL,
  daily_update.name,
  daily_update.creator,
  daily_update.service,
  daily_update.score,
  daily_update.metadata
from daily_update
join Reviewers on Reviewers.name = daily_update.reviewer
on conflict do nothing;
SQL

# Dump the newly inserted items to a CSV
sqlite3 -header -csv - "$local_database_name" \
  "select * from ReviewedItems where createdAt >= strftime('%s', 'now', '-1 minutes');" \
  > ".data/turso/$(basename "$filename")"
