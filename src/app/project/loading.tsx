export default function ProjectLoading() {
  return (
    <div
      data-testid="project-loading"
      role="status"
      aria-label="Loading workspace"
      className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-[#f9f9ff] p-6"
    >
      <div className="size-full min-h-[400px] flex-1 rounded-lg border border-[rgba(195,198,214,0.2)] bg-[#f1f3ff] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
