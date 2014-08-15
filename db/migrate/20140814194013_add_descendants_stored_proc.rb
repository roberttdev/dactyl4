class AddDescendantsStoredProc < ActiveRecord::Migration
  def up
    sql = "DROP FUNCTION IF EXISTS get_descendants(INTEGER);
      CREATE FUNCTION get_descendants(group_id INTEGER)
      RETURNS TABLE (group_id INTEGER)
      AS $$
        WITH RECURSIVE descendants(group_id) AS (
          SELECT id AS group_id
          FROM groups
          WHERE id=$1
          UNION ALL
          SELECT id AS group_id
          FROM descendants D
          INNER JOIN groups G on G.parent_id = D.group_id
        )

      SELECT * from descendants ORDER BY group_id ASC
      $$ LANGUAGE 'sql';"

      execute sql
  end

  def down
    execute "DROP FUNCTION IF EXISTS get_descendants(INTEGER);"
  end
end
