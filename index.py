from imdb import Cinemagoer
import pandas as pd

df = pd.read_csv(
    'movies.csv', encoding='unicode_escape')

print(df.shape)
