import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from app.services.inference import InferenceEngine

class DataAggregator:
    @classmethod
    def aggregate(cls, cleaned_records: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], Dict[str, Any], List[str], List[str]]:
        df = pd.DataFrame(cleaned_records)
        
        # Verify base records exist
        if len(df) == 0:
            return {}, {}, [], []
            
        # Separate duplicate items from main analyses
        if 'is_duplicate' in df.columns:
            total_records = len(df)
            duplicates_count = int(df['is_duplicate'].sum())
            df_valid = df[df['is_duplicate'] == False].copy()
        else:
            total_records = len(df)
            duplicates_count = 0
            df_valid = df.copy()
            
        valid_records = len(df_valid)
        
        # 1. Calculate KPIs
        kpis = {}
        kpis['total_candidates'] = total_records
        kpis['valid_candidates'] = valid_records
        kpis['duplicate_count'] = duplicates_count
        
        # Approval stats
        approved_count = 0
        approval_rate = 0.0
        ci_lower = 0.0
        ci_upper = 0.0
        
        if 'final_status' in df_valid.columns:
            status_counts = df_valid['final_status'].value_counts()
            approved_count = int(status_counts.get('Aprovado', 0))
            approval_rate = float(approved_count / valid_records) if valid_records > 0 else 0.0
            
            # Confidence interval
            ci_lower, ci_upper = InferenceEngine.calculate_wilson_ci(approved_count, valid_records)
            
        kpis['approved_count'] = approved_count
        kpis['approval_rate'] = approval_rate
        kpis['approval_rate_ci'] = [ci_lower, ci_upper]
        
        # Scores KPIs
        avg_test = None
        avg_interview = None
        median_salary = None
        
        if 'score_test' in df_valid.columns:
            test_series = pd.to_numeric(df_valid['score_test'], errors='coerce').dropna()
            if len(test_series) > 0:
                avg_test = float(test_series.mean())
                kpis['avg_score_test'] = avg_test
                kpis['median_score_test'] = float(test_series.median())
                
        if 'score_interview' in df_valid.columns:
            int_series = pd.to_numeric(df_valid['score_interview'], errors='coerce').dropna()
            if len(int_series) > 0:
                avg_interview = float(int_series.mean())
                kpis['avg_score_interview'] = avg_interview
                kpis['median_score_interview'] = float(int_series.median())

        if 'salary_expectation' in df_valid.columns:
            sal_series = pd.to_numeric(df_valid['salary_expectation'], errors='coerce').dropna()
            # Clean extremely high outliers or negative numbers for KPI median
            sal_series_clean = sal_series[(sal_series > 0) & (sal_series < 100000)]
            if len(sal_series_clean) > 0:
                median_salary = float(sal_series_clean.median())
                kpis['median_salary_expectation'] = median_salary

        # Most common values
        if 'stage' in df_valid.columns:
            stage_counts = df_valid['stage'].value_counts()
            if len(stage_counts) > 0:
                kpis['most_common_stage'] = str(stage_counts.index[0])
                
        if 'source_channel' in df_valid.columns:
            source_counts = df_valid['source_channel'].value_counts()
            if len(source_counts) > 0:
                kpis['top_source_channel'] = str(source_counts.index[0])
                
        if 'role_applied' in df_valid.columns:
            role_counts = df_valid['role_applied'].value_counts()
            if len(role_counts) > 0:
                kpis['top_role_applied'] = str(role_counts.index[0])

        # 2. Charts Data
        charts = {}
        
        # Missingness Chart
        missing_data = []
        for col in df_valid.columns:
            m_count = int(df_valid[col].isna().sum())
            m_rate = float(m_count / valid_records) if valid_records > 0 else 0.0
            missing_data.append({
                'column': col,
                'missing_count': m_count,
                'missing_rate': m_rate,
                'completeness_rate': 1.0 - m_rate
            })
        # Sort by missingness desc
        missing_data = sorted(missing_data, key=lambda x: x['missing_rate'], reverse=True)
        charts['missingness'] = missing_data
        
        # Funnel Stage Chart
        # Expected stage order: Triagem -> Teste Técnico -> Entrevista RH -> Entrevista Técnica -> Proposta -> Aprovado
        stage_order = ["Triagem", "Teste Técnico", "Entrevista RH", "Entrevista Técnica", "Proposta", "Aprovado", "Reprovado"]
        funnel_data = []
        if 'stage' in df_valid.columns:
            s_counts = df_valid['stage'].value_counts()
            # Loop expected order first
            for stg in stage_order:
                count = int(s_counts.get(stg, 0))
                funnel_data.append({
                    'stage': stg,
                    'count': count
                })
            # Add any other unexpected stages
            for stg, count in s_counts.items():
                if stg not in stage_order:
                    funnel_data.insert(-1, {'stage': str(stg), 'count': int(count)})
        charts['funnel'] = funnel_data
        
        # Source Distribution & Success Rate Chart
        source_data = []
        if 'source_channel' in df_valid.columns and 'final_status' in df_valid.columns:
            for src in df_valid['source_channel'].dropna().unique():
                src_df = df_valid[df_valid['source_channel'] == src]
                total_src = len(src_df)
                app_src = int((src_df['final_status'] == 'Aprovado').sum())
                app_rate = float(app_src / total_src) if total_src > 0 else 0.0
                source_data.append({
                    'source': str(src),
                    'count': total_src,
                    'approved_count': app_src,
                    'approval_rate': app_rate
                })
            source_data = sorted(source_data, key=lambda x: x['count'], reverse=True)
        charts['sources'] = source_data
        
        # Role Distribution Chart
        role_data = []
        if 'role_applied' in df_valid.columns:
            r_counts = df_valid['role_applied'].value_counts()
            for r, count in r_counts.items():
                role_data.append({
                    'role': str(r),
                    'count': int(count)
                })
        charts['roles'] = role_data

        # Score Test Histogram
        score_test_dist = []
        if 'score_test' in df_valid.columns:
            scores = pd.to_numeric(df_valid['score_test'], errors='coerce').dropna()
            if len(scores) > 0:
                # Bin scores in groups of 10 (0-9, 10-19... 90-100)
                bins = list(range(0, 101, 10))
                # Adjust last bin to include 100
                counts, bin_edges = np.histogram(scores, bins=bins)
                for i in range(len(counts)):
                    start = int(bin_edges[i])
                    end = int(bin_edges[i+1])
                    score_test_dist.append({
                        'bin': f"{start}-{end}",
                        'count': int(counts[i])
                    })
        charts['score_test_distribution'] = score_test_dist

        # Registration Timeline
        timeline_data = []
        if 'timestamp' in df_valid.columns:
            # Try to extract date
            df_valid['parsed_date'] = pd.to_datetime(df_valid['timestamp'], errors='coerce').dt.date
            date_counts = df_valid['parsed_date'].dropna().value_counts().sort_index()
            for dt, count in date_counts.items():
                timeline_data.append({
                    'date': str(dt),
                    'count': int(count)
                })
        charts['timeline'] = timeline_data

        # 3. Dynamic Insights & Limitations
        insights = []
        limitations = []
        
        # Descriptive insights
        if len(source_data) > 0:
            top_src = source_data[0]
            insights.append(f"O canal '{top_src['source']}' é a maior fonte de atração com {top_src['count']} candidatos.")
            # Find best channel by conversion rate (with at least 5 candidates)
            reliable_channels = [s for s in source_data if s['count'] >= 5]
            if reliable_channels:
                best_conv_channel = max(reliable_channels, key=lambda x: x['approval_rate'])
                if best_conv_channel['approval_rate'] > 0:
                    insights.append(
                        f"O canal '{best_conv_channel['source']}' apresenta a maior taxa de conversão "
                        f"para Aprovado ({best_conv_channel['approval_rate']*100:.1f}%), entre canais com mais de 5 inscritos."
                    )
                    
        if avg_test:
            insights.append(f"A nota média global no teste técnico foi de {avg_test:.2f}/100.")
            
        if approved_count > 0:
            insights.append(
                f"A taxa de aprovação geral calculada é de {approval_rate*100:.1f}%, "
                f"com intervalo de confiança de Wilson entre {ci_lower*100:.1f}% e {ci_upper*100:.1f}%."
            )
            
        # Outlier count in experience
        if 'experience_years' in df_valid.columns:
            exp_series = pd.to_numeric(df_valid['experience_years'], errors='coerce').dropna()
            outliers_exp = exp_series[exp_series > 20]
            if len(outliers_exp) > 0:
                insights.append(f"Detectados {len(outliers_exp)} candidatos com tempo de experiência incomum (>20 anos).")
                
        # Data limitations
        total_cells = valid_records * len(df_valid.columns) if valid_records > 0 else 0
        missing_cells = sum(int(df_valid[col].isna().sum()) for col in df_valid.columns) if valid_records > 0 else 0
        overall_missing_rate = missing_cells / total_cells if total_cells > 0 else 0.0

        if overall_missing_rate > 0.10:
            limitations.append(
                f"A base apresenta taxa de campos ausentes de {overall_missing_rate*100:.1f}%. "
                "Cuidado ao fazer cruzamentos em colunas com baixo preenchimento."
            )
        if valid_records < 100:
            limitations.append(
                "O tamanho da base de dados é considerado pequeno (N < 100). "
                "Resultados estatísticos e taxas de conversão podem sofrer forte flutuação e devem ser validados cautelosamente."
            )
        if duplicates_count > 0:
            limitations.append(
                f"Foram identificados e ignorados {duplicates_count} cadastros duplicados nas análises agregadas "
                "para evitar viés de dupla contagem de um mesmo candidato."
            )
            
        if not limitations:
            limitations.append("Não foram identificadas restrições amostrais graves nesta base.")
            
        return kpis, charts, insights, limitations
