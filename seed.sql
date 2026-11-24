-- Inserts eight made-up records, but only when the table is empty.
-- Running it again does nothing, so the starting records are added once.
INSERT INTO records (title, category, description, status)
SELECT v.title, v.category, v.description, v.status
FROM (VALUES
  ('Broken classroom light', 'Electrical', 'The light in Room B12 does not switch on.', 'Pending'),
  ('Leaking tap in hostel bathroom', 'Plumbing', 'The tap in the Block C bathroom drips all night and wastes water.', 'In progress'),
  ('Broken lecture hall chairs', 'Furniture', 'Three chairs in Lecture Hall 2 have broken legs and are unsafe.', 'Pending'),
  ('Flickering corridor lights', 'Electrical', 'Lights in the library corridor flicker and make reading difficult.', 'Completed'),
  ('Blocked sink in laboratory', 'Plumbing', 'The sink in the Chemistry lab drains very slowly and smells.', 'In progress'),
  ('Damaged study desk', 'Furniture', 'A desk in the quiet study room has a cracked top.', 'Completed'),
  ('Socket not working in computer lab', 'Electrical', 'Two power sockets at the back of Computer Lab 1 have no power.', 'Pending'),
  ('Toilet flush broken', 'Plumbing', 'The flush in the ground floor toilet near the cafeteria does not work.', 'Pending')
) AS v(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);
