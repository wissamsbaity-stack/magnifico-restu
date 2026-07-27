-- Update Magnifico hero subtitle copy.

update public.site_settings
set hero_subtitle = 'Burgers, Wraps & More — Done Magnifico.'
where singleton = true
  and (
    hero_subtitle is null
    or hero_subtitle = 'Burgers, wraps, taco boxes & more — done magnifico.'
  );
