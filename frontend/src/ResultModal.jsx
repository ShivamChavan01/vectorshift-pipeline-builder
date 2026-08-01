// ResultModal.jsx — shadcn Dialog showing the /pipelines/parse response (or an error).
// Replaces the native alert() from the original submit flow.

import { CheckCircle2, AlertCircle, GitBranch, Network, ShieldCheck, Boxes } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useResultStore } from './resultStore';

const StatRow = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className={`h-4 w-4 ${accent || 'text-muted-foreground'}`} />
      {label}
    </span>
    <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
  </div>
);

export const ResultModal = () => {
  const { isOpen, result, error, close } = useResultStore();

  const isDag = result?.is_dag;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        {error ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <DialogTitle>Could not reach the backend</DialogTitle>
              </div>
              <DialogDescription>
                {error.message || String(error)}
                <br />
                Make sure it is running at{' '}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  uvicorn main:app --reload
                </code>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                {isDag ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <DialogTitle>Pipeline parsed</DialogTitle>
              </div>
              <DialogDescription>
                {isDag ? (
                  <>
                    Your pipeline is a valid DAG — it can be executed.
                  </>
                ) : (
                  <>
                    Your pipeline contains a cycle — a DAG has no cycles.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <StatRow icon={Network} label="Nodes" value={result?.num_nodes} />
              <StatRow icon={GitBranch} label="Edges" value={result?.num_edges} />
              <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  DAG check
                </span>
                <Badge variant={isDag ? 'success' : 'destructive'}>
                  {isDag ? 'Is a DAG' : 'Has a cycle'}
                </Badge>
              </div>
              {result?.node_type_counts && Object.keys(result.node_type_counts).length > 0 && (
                <div className="rounded-md border border-border bg-background px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                    Node types
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Object.entries(result.node_type_counts).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="font-mono">
                        {type} × {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
