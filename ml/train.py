from __future__ import annotations
import argparse,csv,json
from datetime import datetime,timezone
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score,recall_score,f1_score,roc_auc_score,confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURES=['monthlyRevenue','licensedSeats','activeSeats','logins30d','previousLogins30d','featureUsagePct','unresolvedTickets','latePayments90d','satisfactionScore','daysUntilRenewal']
LABEL='churned30d';SEED=42
def load(path:Path):
    with path.open(newline='',encoding='utf-8') as f: rows=list(csv.DictReader(f))
    missing=[x for x in FEATURES+[LABEL] if not rows or x not in rows[0]]
    if missing: raise ValueError(f"Missing required columns: {', '.join(missing)}")
    if len(rows)<30: raise ValueError('At least 30 labelled rows are required.')
    try: X=[[float(r[x]) for x in FEATURES] for r in rows];y=[int(r[LABEL]) for r in rows]
    except ValueError as e: raise ValueError('All features and labels must be numeric.') from e
    if set(y)!={0,1}: raise ValueError('churned30d must contain both 0 and 1 labels.')
    return X,y
def main():
    p=argparse.ArgumentParser();p.add_argument('--input',type=Path,required=True);p.add_argument('--output',type=Path,default=Path('public/model'));a=p.parse_args();X,y=load(a.input)
    Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=.25,random_state=SEED,stratify=y);scaler=StandardScaler().fit(Xtr);model=LogisticRegression(random_state=SEED,max_iter=2000).fit(scaler.transform(Xtr),ytr);prob=model.predict_proba(scaler.transform(Xte))[:,1];pred=(prob>=.5).astype(int)
    metrics={'precision':precision_score(yte,pred,zero_division=0),'recall':recall_score(yte,pred,zero_division=0),'f1':f1_score(yte,pred,zero_division=0),'rocAuc':roc_auc_score(yte,prob),'confusionMatrix':confusion_matrix(yte,pred).tolist(),'testRows':len(yte)}
    trained=datetime.now(timezone.utc).isoformat();artifact={'schemaVersion':1,'modelType':'logistic_regression','featureOrder':FEATURES,'coefficients':model.coef_[0].tolist(),'intercept':float(model.intercept_[0]),'means':dict(zip(FEATURES,scaler.mean_.tolist())),'scales':dict(zip(FEATURES,scaler.scale_.tolist())),'trainedAt':trained,'datasetLabel':'Synthetic sample churn history','synthetic':True}
    metadata={'trainedAt':trained,'label':LABEL,'predictionWindow':'30 days','randomSeed':SEED,'syntheticEvaluation':True,'metrics':metrics};a.output.mkdir(parents=True,exist_ok=True);(a.output/'model.json').write_text(json.dumps(artifact,indent=2));(a.output/'metadata.json').write_text(json.dumps(metadata,indent=2));report=Path('ml/output');report.mkdir(parents=True,exist_ok=True);(report/'model.json').write_text(json.dumps(artifact,indent=2));(report/'metadata.json').write_text(json.dumps(metadata,indent=2));print(json.dumps(metrics,indent=2))
if __name__=='__main__': main()
