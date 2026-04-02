-- Wuzzabug seed data
-- Run this in your Supabase SQL Editor
-- It back-fills 25 approved bugs, votes, and reactions for your admin account

do $$
declare
  admin_id uuid;
begin

  -- Get your admin user ID
  select id into admin_id from auth.users where email = 'arlochild2026@gmail.com';

  if admin_id is null then
    raise exception 'Admin user not found. Check the email in this script.';
  end if;

  -- Make sure a profile exists for the admin
  insert into profiles (id) values (admin_id) on conflict (id) do nothing;

  -- Insert 25 bugs and collect their IDs
  insert into bugs (title, description, location, image_url, status, funny_score, submitted_by) values

    ('Spider Decided My Coffee Cup Is His House Now',
     'I wanted caffeine. He wanted real estate. We negotiated. I lost.',
     'Kitchen, Cincinnati OH',
     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
     'approved', 847, admin_id),

    ('This Cockroach Has Been Living in My Keyboard for Six Months',
     'He has seen things. Dark things. My browser history things.',
     'Home Office, Portland OR',
     'https://images.unsplash.com/photo-1590862375745-24aea71c5dd8?w=800&q=80',
     'approved', 712, admin_id),

    ('Ant Army Staged a Coup on My Desk at 3AM',
     'They took the granola bar. They left a note. I cannot read ant.',
     'Bedroom Desk, Austin TX',
     'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80',
     'approved', 634, admin_id),

    ('Mosquito Chose Violence at 2AM',
     'I have not slept. I can hear it. It is taunting me.',
     'Bedroom, Miami FL',
     'https://images.unsplash.com/photo-1583759564752-0c2fd96d2de3?w=800&q=80',
     'approved', 589, admin_id),

    ('Bee vs. My Entire Picnic. Bee Won.',
     'We had 14 people at this picnic. One bee. The math does not check out.',
     'Riverside Park, Denver CO',
     'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=800&q=80',
     'approved', 521, admin_id),

    ('Praying Mantis Took My Parking Spot',
     'Sat on my windshield for two hours. Did not move. Absolute monarch.',
     'Office Parking Lot, Nashville TN',
     'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&q=80',
     'approved', 498, admin_id),

    ('Found a Centipede in the Shower. Moved Out.',
     'I did not pack my clothes. I simply left. The centipede can have the lease.',
     'Bathroom, Chicago IL',
     'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=800&q=80',
     'approved', 476, admin_id),

    ('Wasp Built a Mansion in My Mailbox',
     'Been three weeks. My Amazon packages are their problem now.',
     'Front Porch, Atlanta GA',
     'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&q=80',
     'approved', 445, admin_id),

    ('Moth Is Convinced My Lamp Is the Sun',
     'Seven hours. It has been doing this for seven hours.',
     'Living Room, Seattle WA',
     'https://images.unsplash.com/photo-1590503656578-a31e0f1d6c49?w=800&q=80',
     'approved', 423, admin_id),

    ('Dragonfly Joined My Zoom Call and Became Team Lead',
     'Karen from accounting said nothing. Dave promoted it.',
     'Backyard, Phoenix AZ',
     'https://images.unsplash.com/photo-1566394808897-6c34c2a0d96c?w=800&q=80',
     'approved', 401, admin_id),

    ('Stink Bug Found My Laundry First',
     'Do you know how long it takes to un-stink 40 shirts? I do now.',
     'Laundry Room, Columbus OH',
     'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=800&q=80',
     'approved', 387, admin_id),

    ('Grasshopper Commandeered My BBQ',
     'Sits on the grill lid every time I turn it on. Heat does not concern him.',
     'Backyard, Dallas TX',
     'https://images.unsplash.com/photo-1557483163-b1daefc5f2a4?w=800&q=80',
     'approved', 365, admin_id),

    ('Cricket Has Been Chirping Behind My Drywall Since Tuesday',
     'I can hear it right now. It sounds happy. I am not.',
     'Bedroom Wall, Boston MA',
     'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?w=800&q=80',
     'approved', 344, admin_id),

    ('June Bug Launched Itself at My Face Four Times',
     'Same bug. Four times. I was stationary. This is targeted.',
     'Back Porch, Houston TX',
     'https://images.unsplash.com/photo-1574068468577-87519c91f9f5?w=800&q=80',
     'approved', 321, admin_id),

    ('Ladybug Convention in My Car',
     'I counted 37. It is their car now. I take the bus.',
     'Parking Garage, Minneapolis MN',
     'https://images.unsplash.com/photo-1595433562696-756e3f7a60d1?w=800&q=80',
     'approved', 298, admin_id),

    ('Earwig Evolved, Got a LinkedIn, Applied to My Job',
     'Fast learner. Strong pincer skills. Five-year plan unclear.',
     'Home Office, San Francisco CA',
     'https://images.unsplash.com/photo-1597002973885-8c90683fa6e0?w=800&q=80',
     'approved', 276, admin_id),

    ('This Caterpillar Ate My Entire Herb Garden',
     'The basil. The rosemary. The mint. Gone. It has the audacity to look satisfied.',
     'Back Garden, Portland OR',
     'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
     'approved', 254, admin_id),

    ('Beetle in My Car Has Been There Since March',
     'I think it is navigating. Made a wrong turn in Toledo.',
     'Highway 71, Kansas City MO',
     'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
     'approved', 243, admin_id),

    ('Silverfish in My Cookbook. The Irony Is Not Lost on Me.',
     'Was it drawn in by the recipes? Did it judge them? Several are bad.',
     'Kitchen Shelf, New Orleans LA',
     'https://images.unsplash.com/photo-1553531384-397c80973a0b?w=800&q=80',
     'approved', 231, admin_id),

    ('This Fly Has Attended More of My Meetings Than My Manager',
     'Perfect attendance. Never speaks. Still somehow the most useful one there.',
     'Home Office, Remote',
     'https://images.unsplash.com/photo-1526336179256-1347bdb255ee?w=800&q=80',
     'approved', 219, admin_id),

    ('Termites Discovered My Guitar Is Delicious',
     'Six years of lessons. Three weeks of termites. One very ventilated guitar.',
     'Music Room, Austin TX',
     'https://images.unsplash.com/photo-1584907797015-7554cd315667?w=800&q=80',
     'approved', 207, admin_id),

    ('Jumping Spider Won't Stop Making Eye Contact',
     'I looked away. It moved to maintain the stare. This is a staring contest now.',
     'Bathroom Mirror, Denver CO',
     'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80',
     'approved', 195, admin_id),

    ('Millipede Colonized My Basement, Filed for Statehood',
     'One millipede. Then five. Now there is a flag. I do not recognize their government.',
     'Basement, Cleveland OH',
     'https://images.unsplash.com/photo-1590862375745-24aea71c5dd8?w=800&q=80',
     'approved', 183, admin_id),

    ('Firefly Flew Into My Drink. Drink Is Now Technically Lit.',
     'I considered drinking it. I did not. It escaped. The party was better for it.',
     'Backyard BBQ, Memphis TN',
     'https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=800&q=80',
     'approved', 171, admin_id),

    ('Tick Hitchhiked on Me for Fourteen Miles',
     'The audacity. The commitment. Not even a thank you.',
     'Appalachian Trail, Virginia',
     'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
     'approved', 159, admin_id);

  -- Seed votes table (so hasVoted state tracks correctly)
  insert into votes (bug_id, user_id)
  select id, admin_id from bugs
  where submitted_by = admin_id
  and status = 'approved'
  on conflict do nothing;

  -- Seed emoji reactions across bugs
  insert into reactions (bug_id, user_id, emoji)
  select b.id, admin_id, e.emoji
  from (select id from bugs where submitted_by = admin_id and status = 'approved') b
  cross join (values ('😂'), ('🔥'), ('😱'), ('🤮'), ('💀')) as e(emoji)
  where random() < 0.6   -- ~60% chance each bug gets each reaction
  on conflict do nothing;

end $$;
