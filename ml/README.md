# Optional trained logistic model

This optional pipeline trains an explainable logistic-regression baseline from labelled churn history. The included CSV is synthetic and its metrics are demonstration metrics, not production performance.

```bash
python -m venv .venv
.venv\Scripts\pip install -r ml/requirements.txt
python ml/train.py --input ml/sample_churn_history.csv
```

`churned30d` is the binary label: `1` means the customer churned within the following 30 days. Features must be measured before that window. The script rejects small, invalid, single-class, or non-numeric datasets, uses a fixed seed and stratified split, standardises training data without leaking test statistics, calculates metrics from held-out predictions, and exports coefficients and preprocessing values to `public/model/`.
