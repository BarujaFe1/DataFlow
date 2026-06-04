import numpy as np
import pandas as pd
from scipy import stats
from typing import List, Dict, Any, Tuple, Optional

class InferenceEngine:
    @staticmethod
    def calculate_cohens_d(group1: pd.Series, group2: pd.Series) -> float:
        n1, n2 = len(group1), len(group2)
        v1, v2 = group1.var(), group2.var()
        m1, m2 = group1.mean(), group2.mean()
        
        # Pooled standard deviation
        pooled_std = np.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2))
        if pooled_std == 0:
            return 0.0
        return float((m1 - m2) / pooled_std)

    @classmethod
    def run_chi_square(cls, df: pd.DataFrame, cat_col: str, target_col: str) -> Optional[Dict[str, Any]]:
        # Filter nulls
        clean_df = df[[cat_col, target_col]].dropna()
        if len(clean_df) < 30:
            return None
            
        contingency_table = pd.crosstab(clean_df[cat_col], clean_df[target_col])
        
        # Check table dimensions (must be at least 2x2)
        if contingency_table.shape[0] < 2 or contingency_table.shape[1] < 2:
            return None
            
        # Check cell counts (should be >= 5 in at least 80% of cells for Chi-square validity)
        expected = stats.contingency.expected_freq(contingency_table)
        if (expected < 5).mean() > 0.20:
            # We can still run it, but flag as caution
            pass
            
        try:
            res = stats.chi2_contingency(contingency_table)
            stat, p_val, dof, expected_vals = res.statistic, res.pvalue, res.dof, res.expected_freq
            
            sig = bool(p_val < 0.05)
            
            if sig:
                interpretation = (
                    f"Existe uma associação estatisticamente significativa entre a coluna '{cat_col}' "
                    f"e o '{target_col}' (p-valor = {p_val:.4f}). Isto indica que a distribuição de "
                    f"resultados não é uniforme entre os diferentes grupos de '{cat_col}'."
                )
            else:
                interpretation = (
                    f"Não foi encontrada associação estatisticamente significativa entre '{cat_col}' "
                    f"e o '{target_col}' (p-valor = {p_val:.4f}). As diferenças observadas nas taxas "
                    f"podem ser explicadas por variação amostral aleatória."
                )
                
            limitations = (
                "1. Associação não implica causalidade: o canal de origem ou a escolaridade "
                "pode estar correlacionada a outras variáveis omitidas. "
                "2. Este teste supõe que as observações são independentes. "
                "3. Não utilize este resultado para criar regras de triagem discriminatórias "
                "ou automatizadas que penalizem determinados grupos."
            )
            
            # Simple effect size (Cramer's V)
            n = contingency_table.sum().sum()
            min_dim = min(contingency_table.shape) - 1
            cramers_v = np.sqrt(stat / (n * min_dim)) if min_dim > 0 and n > 0 else 0.0
            
            return {
                'test_name': f"Teste de Associação Qui-Quadrado ({cat_col} vs {target_col})",
                'variables': [cat_col, target_col],
                'statistic': float(stat),
                'p_value': float(p_val),
                'effect_size': float(cramers_v),
                'significance': sig,
                'interpretation': interpretation,
                'limitations': limitations
            }
        except Exception:
            return None

    @classmethod
    def run_t_test(cls, df: pd.DataFrame, num_col: str, group_col: str) -> Optional[Dict[str, Any]]:
        # Compare numerical scores (e.g. score_test) between final_status (Aprovado vs Reprovado/Em Processo)
        clean_df = df[[num_col, group_col]].dropna()
        
        # Standardize group_col to binary: 'Aprovado' vs 'Outros'
        clean_df['binary_group'] = clean_df[group_col].apply(lambda x: 'Aprovado' if str(x) == 'Aprovado' else 'Outros')
        
        gp_approved = clean_df[clean_df['binary_group'] == 'Aprovado'][num_col]
        gp_others = clean_df[clean_df['binary_group'] == 'Outros'][num_col]
        
        if len(gp_approved) < 8 or len(gp_others) < 8:
            return None
            
        try:
            # Use Welch's t-test (equal_var=False) because standard deviation may vary between groups
            res = stats.ttest_ind(gp_approved, gp_others, equal_var=False)
            stat, p_val = res.statistic, res.pvalue
            
            sig = bool(p_val < 0.05)
            cohens_d = cls.calculate_cohens_d(gp_approved, gp_others)
            
            mean1, mean2 = gp_approved.mean(), gp_others.mean()
            
            if sig:
                direction = "maior" if mean1 > mean2 else "menor"
                interpretation = (
                    f"A diferença de notas da coluna '{num_col}' entre os candidatos Aprovados "
                    f"(Média = {mean1:.2f}) e Não Aprovados/Em Processo (Média = {mean2:.2f}) é estatisticamente "
                    f"significativa (p-valor = {p_val:.4f}, t = {stat:.2f}). Os candidatos aprovados obtiveram média "
                    f"{direction} com tamanho de efeito Cohen's d = {cohens_d:.2f}."
                )
            else:
                interpretation = (
                    f"Não há diferença estatisticamente significativa nas notas de '{num_col}' entre "
                    f"os grupos (p-valor = {p_val:.4f}). A média dos Aprovados ({mean1:.2f}) é estatisticamente "
                    f"semelhante à dos demais candidatos ({mean2:.2f}) sob este nível de confiança."
                )
                
            limitations = (
                "1. O teste t supõe distribuição aproximadamente normal e variâncias semelhantes nas populações, "
                "embora o teste de Welch seja robusto a desvios de variância. "
                "2. Outliers extremos podem distorcer a média. "
                "3. Este teste não avalia a qualidade individual de candidatos, mas sim a calibragem global "
                "das notas em relação ao funil."
            )
            
            return {
                'test_name': f"Teste t de Welch para Comparação de Médias ({num_col} por Status Final)",
                'variables': [num_col, group_col],
                'statistic': float(stat),
                'p_value': float(p_val),
                'effect_size': float(cohens_d),
                'significance': sig,
                'interpretation': interpretation,
                'limitations': limitations
            }
        except Exception:
            return None

    @classmethod
    def run_anova(cls, df: pd.DataFrame, num_col: str, group_col: str) -> Optional[Dict[str, Any]]:
        # Compare numerical scores (e.g. score_test) across categories (e.g. role_applied, education_level)
        clean_df = df[[num_col, group_col]].dropna()
        
        # Group counts
        counts = clean_df[group_col].value_counts()
        valid_groups = counts[counts >= 5].index.tolist()
        
        if len(valid_groups) < 3:
            return None # Must have at least 3 groups with 5+ observations
            
        groups_data = [clean_df[clean_df[group_col] == g][num_col] for g in valid_groups]
        
        try:
            res = stats.f_oneway(*groups_data)
            stat, p_val = res.statistic, res.pvalue
            sig = bool(p_val < 0.05)
            
            # Simple effect size (eta squared approximation)
            # SS_between / SS_total
            all_vals = pd.concat(groups_data)
            grand_mean = all_vals.mean()
            ss_total = ((all_vals - grand_mean) ** 2).sum()
            ss_between = sum([len(g) * ((g.mean() - grand_mean) ** 2) for g in groups_data])
            eta_sq = float(ss_between / ss_total) if ss_total > 0 else 0.0
            
            if sig:
                interpretation = (
                    f"Existe variação estatisticamente relevante nas notas da coluna '{num_col}' "
                    f"entre os diferentes grupos de '{group_col}' (p-valor = {p_val:.4f}, F = {stat:.2f}). "
                    f"Isso indica que pelo menos um dos grupos possui média significativamente diferente dos outros, "
                    f"com tamanho de efeito (eta quadrado) de {eta_sq:.2f}."
                )
            else:
                interpretation = (
                    f"Não há diferença estatisticamente significativa nas notas de '{num_col}' "
                    f"ao comparar os grupos de '{group_col}' (p-valor = {p_val:.4f}). "
                    f"As notas médias são estatisticamente semelhantes entre as categorias avaliadas."
                )
                
            limitations = (
                "1. A ANOVA supõe homogeneidade de variâncias (homocedasticidade) e normalidade dos resíduos. "
                "2. O teste não diz quais grupos diferem entre si (requer testes adicionais post-hoc como Tukey HSD). "
                "3. Utilize com cautela, pois desbalanceamento acentuado no tamanho dos grupos pode afetar o poder do teste."
            )
            
            return {
                'test_name': f"Análise de Variância ANOVA de uma via ({num_col} por {group_col})",
                'variables': [num_col, group_col],
                'statistic': float(stat),
                'p_value': float(p_val),
                'effect_size': float(eta_sq),
                'significance': sig,
                'interpretation': interpretation,
                'limitations': limitations
            }
        except Exception:
            return None

    @staticmethod
    def calculate_wilson_ci(successes: int, total: int, confidence: float = 0.95) -> Tuple[float, float]:
        if total == 0:
            return 0.0, 0.0
        p = successes / total
        z = stats.norm.ppf(1 - (1 - confidence) / 2)
        denominator = 1 + z**2 / total
        centre_adj_p = p + z**2 / (2 * total)
        error_term = z * np.sqrt(p * (1 - p) / total + z**2 / (4 * total**2))
        
        lower = (centre_adj_p - error_term) / denominator
        upper = (centre_adj_p + error_term) / denominator
        
        return max(0.0, float(lower)), min(1.0, float(upper))

    @classmethod
    def run_all_inference(cls, cleaned_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        df = pd.DataFrame(cleaned_records)
        
        # Verify columns exist
        cols = df.columns
        results = []
        
        if len(df) < 15:
            return [] # Insufficient rows for statistical tests
            
        # 1. Chi-square tests
        if 'source_channel' in cols and 'final_status' in cols:
            res = cls.run_chi_square(df, 'source_channel', 'final_status')
            if res:
                results.append(res)
                
        if 'education_level' in cols and 'final_status' in cols:
            res = cls.run_chi_square(df, 'education_level', 'final_status')
            if res:
                results.append(res)
                
        # 2. t-tests
        if 'score_test' in cols and 'final_status' in cols:
            res = cls.run_t_test(df, 'score_test', 'final_status')
            if res:
                results.append(res)
                
        if 'score_interview' in cols and 'final_status' in cols:
            res = cls.run_t_test(df, 'score_interview', 'final_status')
            if res:
                results.append(res)
                
        # 3. ANOVA tests
        if 'score_test' in cols and 'education_level' in cols:
            res = cls.run_anova(df, 'score_test', 'education_level')
            if res:
                results.append(res)
                
        if 'score_test' in cols and 'role_applied' in cols:
            res = cls.run_anova(df, 'score_test', 'role_applied')
            if res:
                results.append(res)
                
        return results
