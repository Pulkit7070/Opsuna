"use client";

import React from "react";
import Head from "next/head";

export default function DocsPage() {
  return (
    <>
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <section className="relative">
          <div className="inline-flex items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ccff00] mb-6">
            SYSTEM_MANUAL_V1.0
          </div>
          <h1 className="mb-4 text-5xl font-black tracking-tighter text-white md:text-7xl lg:text-[5rem] leading-[0.9]">
            Documentation
          </h1>
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-[#888] md:text-xl">
            Everything you need to know about building, orchestrating, and
            deploying with Opsuna. Master the agentic workflow engine.
          </p>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-[#333] via-[#1a1a1a] to-transparent my-4" />

        {/* Content Section */}
        <section className="prose prose-invert max-w-none prose-h2:text-3xl prose-h2:font-bold prose-h2:tracking-tight prose-p:text-[#999] prose-p:leading-relaxed prose-strong:text-white prose-a:text-[#ccff00]">
          <h2 className="text-white mb-6">Introduction</h2>
          
          <p className="mb-6 text-lg text-[#ccc]">
            Opsuna is a high-performance, <strong className="text-white">agentic workflow orchestration platform</strong> built for the modern AI stack. Unlike traditional automation tools, Opsuna processes complex reasoning chains directly within your infrastructure, ensuring <span className="text-[#ccff00]">zero latency</span> and absolute control.
          </p>

          <p>
            This means no unexpected timeouts, no black-box decision making, and no
            vendor lock-in. You are orchestrating on the metal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12 not-prose">
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] group hover:border-[#ccff00]/30 transition-colors">
              <div className="w-10 h-10 rounded bg-[#111] flex items-center justify-center mb-4 text-[#ccff00]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ccff00] transition-colors">
                Local-First
              </h3>
              <p className="text-sm text-[#666]">
                Run your agents locally or on your own private cloud. Your data never leaves your perimeter.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] group hover:border-[#ccff00]/30 transition-colors">
              <div className="w-10 h-10 rounded bg-[#111] flex items-center justify-center mb-4 text-[#ccff00]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ccff00] transition-colors">
                Real-Time
              </h3>
              <p className="text-sm text-[#666]">
                Streaming responses, instant state updates, and live debugging tools built-in.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mt-12 mb-4">Core Architecture</h3>
          <p>
            Opsuna is built on a <span className="text-[#ccff00] font-mono text-sm bg-[#ccff00]/10 px-1 py-0.5 rounded">Graph-based Execution Engine</span>. Every workflow is a directed acyclic graph (DAG) of nodes, where each node represents a discrete unit of work—whether it's an LLM call, a database query, or a custom function.
          </p>

          <pre className="bg-[#050505] border border-[#1a1a1a] p-4 rounded-lg overflow-x-auto text-sm text-[#888] not-prose my-6 font-mono">
{`// Example Workflow Definition
const workflow = new Workflow('rag-pipeline');

workflow
  .addNode('ingest', new IngestNode({ source: 'docs' }))
  .addNode('embed', new EmbedNode({ model: 'ada-002' }))
  .addNode('store', new VectorStoreNode({ collection: 'opsuna' }))
  .connect('ingest', 'embed')
  .connect('embed', 'store');

await workflow.execute();`}
          </pre>

           <p>
            Ready to get started? Check out the <a href="/docs/installation" className="text-[#ccff00] hover:underline decoration-[#ccff00] underline-offset-4">Installation</a> guide to set up your first project.
          </p>
        </section>
      </div>
      
      {/* Footer / Next Link */}
      <div className="mt-20 flex justify-end">
         <a href="/docs/installation" className="group flex flex-col items-end gap-1 text-right">
            <span className="text-xs font-bold text-[#444] uppercase tracking-widest">Next Step</span>
            <span className="text-2xl font-bold text-white group-hover:text-[#ccff00] transition-colors">Installation &rarr;</span>
         </a>
      </div>
    </>
  );
}
