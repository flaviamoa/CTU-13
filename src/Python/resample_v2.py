import pandas as pd
import os
import time
import re

# Regex para validar IPv4 com pontos
ip_with_dots_pattern = re.compile(r'^(?:(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)(?:\.|$)){4}$')

def is_valid_ip(ip):
    # Verificar se o valor corresponde ao padrão de IP com pontos
    return bool(ip_with_dots_pattern.match(ip))

# Lista para armazenar todos os DataFrames
dfs = []

# Cabeçalhos desejados para o DataFrame final
headings = ["frame_time", "frame_len", "ip_src", "ip_dst", "tcp_window_size", "tcp_time_delta"]

start_time = time.time()
print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time)))

for file in os.listdir():
    if file.endswith(".csv"):
        now = time.time()
        now = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(now))
        print(f'{now} Arquivo: {file}')

        # Carregar o DataFrame
        df = pd.read_csv(file, header=None,skiprows=1)

        # Eliminar a coluna 'frame.protocols'
        df = df.drop(df.columns[2], axis=1)
        
        # Definir os nomes das colunas manualmente
        df.columns = headings

        #Filtrar linhas com IPs malformatados
        df = df[df['ip_src'].apply(is_valid_ip) & df['ip_dst'].apply(is_valid_ip)]

        # Atualizar os índices das colunas após a exclusão
        #df.columns = range(df.shape[1])

        # Converter a coluna 'frame.time' para datetime, se ainda não estiver
        df.iloc[:, 0] = pd.to_datetime(df.iloc[:, 0], format='mixed')


        # Resample por 15 segundos, agrupando por IP e aplicar a média para colunas numéricas
        #df_resampled = df.groupby([df.columns[2], df.columns[3]]).resample('15S', on=df.columns[0]).mean()
        df_resampled = df.groupby(['ip_src', 'ip_dst']).resample('15S', on='frame_time').mean()

        # Resetar o índice se desejar
        df_resampled = df_resampled.reset_index()


        # Adicionar o DataFrame resultante à lista
        dfs.append(df_resampled)

        now = time.time()
        now = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(now))
        print (f"{now} Fim do arquivo {file}")

# Concatenar todos os DataFrames da lista
final_df = pd.concat(dfs, sort=False)

# Reordenar as colunas para a ordem desejada
final_df = final_df[headings]

final_df = final_df[final_df['ip_src'].apply(is_valid_ip) & final_df['ip_dst'].apply(is_valid_ip)]

# Salvar o DataFrame final em um arquivo CSV sem especificar o index_label
final_df.to_csv('full_capture20110818_preprocessed_flavia.csv', index=False)