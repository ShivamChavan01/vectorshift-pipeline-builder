import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { ResultModal } from './ResultModal';

function App() {
  return (
    <div className="app flex h-screen flex-col overflow-hidden">
      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton />
      <ResultModal />
    </div>
  );
}

export default App;
