import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns

out_dir = Path(__file__).resolve().parent
out_dir.mkdir(exist_ok=True)

path = Path('Dataset/archive (21)/cleaned_dataset/archive (22)/Battery_Data_Cleaned.csv')
df = pd.read_csv(path)

summary = (
    df.groupby('ambient_temperature', as_index=False)
      .agg(avg_capacity=('Capacity', 'mean'), avg_re=('Re', 'mean'), avg_rct=('Rct', 'mean'))
      .sort_values('ambient_temperature')
)

plt.figure(figsize=(8, 4.8), dpi=220)
sns.barplot(data=summary, x='ambient_temperature', y='avg_capacity', color='#2e86de', alpha=0.95)
plt.title('Average capacity by ambient temperature', fontsize=12)
plt.xlabel('Ambient temperature (°C)')
plt.ylabel('Average capacity')
plt.tight_layout()
plt.savefig(out_dir / 'capacity_by_temperature.png', bbox_inches='tight')
plt.close()

plt.figure(figsize=(8, 4.8), dpi=220)
sns.scatterplot(data=df, x='Re', y='Capacity', hue='ambient_temperature', palette='viridis', s=22, alpha=0.7)
plt.title('Capacity vs internal resistance', fontsize=12)
plt.xlabel('Internal resistance (Re)')
plt.ylabel('Capacity')
plt.legend(title='Temperature (°C)', frameon=False)
plt.tight_layout()
plt.savefig(out_dir / 'capacity_vs_re.png', bbox_inches='tight')
plt.close()

plt.figure(figsize=(8, 4.8), dpi=220)
sns.boxplot(data=df, x='ambient_temperature', y='Rct', color='#f7b731', width=0.55)
plt.title('Distribution of charge transfer resistance by temperature', fontsize=12)
plt.xlabel('Ambient temperature (°C)')
plt.ylabel('Rct')
plt.tight_layout()
plt.savefig(out_dir / 'rct_by_temperature.png', bbox_inches='tight')
plt.close()

numeric_df = df[['Capacity', 'Re', 'Rct', 'ambient_temperature']].dropna()
cor = numeric_df.corr()
plt.figure(figsize=(6, 5), dpi=220)
sns.heatmap(cor, annot=True, cmap='coolwarm', fmt='.2f', linewidths=0.5, cbar=True)
plt.title('Correlation matrix of battery features', fontsize=12)
plt.tight_layout()
plt.savefig(out_dir / 'feature_correlation.png', bbox_inches='tight')
plt.close()

# Comparison bar charts for side-by-side insights
comparison_df = (
    df.groupby(['ambient_temperature'], as_index=False)
      .agg(avg_capacity=('Capacity', 'mean'), avg_re=('Re', 'mean'), avg_rct=('Rct', 'mean'))
      .sort_values('ambient_temperature')
)

comparison_df = comparison_df.melt(
    id_vars='ambient_temperature',
    value_vars=['avg_capacity', 'avg_re', 'avg_rct'],
    var_name='metric',
    value_name='value'
)

plt.figure(figsize=(8.5, 4.8), dpi=220)
sns.barplot(data=comparison_df, x='ambient_temperature', y='value', hue='metric', palette='Set2')
plt.title('Comparison of battery metrics by temperature', fontsize=12)
plt.xlabel('Ambient temperature (°C)')
plt.ylabel('Average value')
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig(out_dir / 'metric_comparison_bars.png', bbox_inches='tight')
plt.close()

# Create a simpler bar chart of average capacity by temperature for paper-style comparison
plt.figure(figsize=(7.2, 4.2), dpi=220)
sns.barplot(data=comparison_df[comparison_df['metric'] == 'avg_capacity'], x='ambient_temperature', y='value', color='#4c78a8')
plt.title('Average capacity comparison', fontsize=12)
plt.xlabel('Ambient temperature (°C)')
plt.ylabel('Average capacity')
plt.tight_layout()
plt.savefig(out_dir / 'capacity_comparison_bars.png', bbox_inches='tight')
plt.close()

print('Generated charts:')
for p in sorted(out_dir.glob('*.png')):
    print(p.name)
