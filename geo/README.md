Create the countries:

```shell
ogr2ogr \
  -f GeoJSON \
  countries.json \
  ne_110m_admin_0_countries.shp
```

Cities:

```shell
ogr2ogr \
  -f GeoJSON \
  -where "SCALERANK < 8" \
  places.json \
  ne_110m_populated_places_simple.shp
```

Combine:

```shell
topojson \
  -o world.json \
  --id-property su_a3 \
  --properties name=name \
  -- \
  countries.json \
  places.json
```
