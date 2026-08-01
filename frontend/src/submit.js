// submit.js

import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { Button } from './components/ui/button';
import { useResultStore } from './resultStore';

export const SubmitButton = () => {
    const { nodes, edges } = useStore(
        (state) => ({ nodes: state.nodes, edges: state.edges }),
        shallow
    );

    const showResult = useResultStore((state) => state.showResult);
    const showError = useResultStore((state) => state.showError);

    const handleSubmit = async () => {
        const pipeline = JSON.stringify({ nodes, edges });

        try {
            const response = await fetch('http://localhost:8000/pipelines/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ pipeline }),
            });

            if (!response.ok) {
                throw new Error(`Backend responded with ${response.status}`);
            }

            const data = await response.json();
            showResult(data);
        } catch (error) {
            showError(error);
        }
    };

    return (
        <div className="submit-bar flex flex-shrink-0 justify-center border-t border-border bg-secondary px-5 py-3">
            <Button size="lg" onClick={handleSubmit}>
                Submit
            </Button>
        </div>
    );
}
