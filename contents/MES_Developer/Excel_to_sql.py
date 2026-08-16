import os
import pandas as pd
import numpy as np

# 파일 경로 설정
excel_path = "C:\\Users\\junipa7\\Documents\\myhomepage\\contents\\MES_Developer\DATA_20230221.xls"
output_sql_path = "C:\\Users\\junipa7\\Documents\\myhomepage\\contents\\MES_Developer\\DATA_20230221_insert.sql"

def format_sql_val(val):
    if pd.isna(val) or val is None or str(val).strip() in ('', 'NaT', 'nan', 'None'):
        return "NULL"
    if isinstance(val, (int, np.integer)):
        return str(val)
    if isinstance(val, (float, np.floating)):
        # 정수형 실수(예: 10.0)는 정수 문자열로 처리
        return str(int(val)) if val.is_integer() else str(val)
    if isinstance(val, bool):
        return "1" if val else "0"
    if isinstance(val, (pd.Timestamp, str)):
        val_str = str(val).replace("'", "''")  # SQL Single quote escaping
        return f"'{val_str}'"
    
    val_str = str(val).replace("'", "''")
    return f"'{val_str}'"

def generate_insert_sql(excel_file, output_file):
    excel_data = pd.ExcelFile(excel_file)
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- MS-SQL Insert Statements Generated from Excel\n")
        f.write(f"-- Source: {excel_file}\n\n")
        
        for sheet_name in excel_data.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # 빈 시트 건너뛰기
            if df.empty:
                continue
                
            table_name = sheet_name.strip()
            columns = [f"[{col.strip()}]" for col in df.columns]
            col_list_str = ", ".join(columns)
            
            f.write(f"-- Table: {table_name}\n")
            
            for _, row in df.iterrows():
                formatted_values = [format_sql_val(val) for val in row]
                val_list_str = ", ".join(formatted_values)
                sql = f"INSERT INTO [{table_name}] ({col_list_str}) VALUES ({val_list_str});\n"
                f.write(sql)
            
            f.write("\n")
            
    print(f"SQL 파일 생성이 완료되었습니다: {output_file}")

if __name__ == "__main__":
    generate_insert_sql(excel_path, output_sql_path)