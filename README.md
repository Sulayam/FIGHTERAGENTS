<div align="center">
  <h1>FighterAgents</h1>
  <h3>An AI-powered game simulation engine that brings UFC fighters to life as interactive agents.</h3>
</div>

</br>

<p align="center">
    <img src="static/diagrams/system_architecture.png" alt="Architecture" width="600">
</p>

## About

FighterAgents is an AI agent simulation engine that impersonates UFC fighters in an interactive game environment. Walk around the arena, approach fighters like Conor McGregor, Khabib Nurmagomedov, or Dana White, and have real conversations powered by LLMs.

This project is built on top of the [PhiloAgents](https://github.com/neural-maze/philoagents-course) course by Miguel Otero Pedrido and Paul Iusztin. The original course taught how to build AI agents impersonating philosophers — FighterAgents extends that foundation with a UFC theme.

**Key features:**
- AI agents that embody UFC fighters with authentic personalities
- Agentic RAG system for real-world knowledge retrieval
- Short-term and long-term memory with MongoDB
- RESTful API with real-time WebSocket communication
- Production-ready architecture with Docker deployment

**Tech stack:** LangGraph, LangChain, Groq, MongoDB, FastAPI, WebSockets, Phaser 3, Docker

<video src="https://github.com/user-attachments/assets/aedc041e-00ed-42ce-99f2-24ce74847e7a"/></video>

## What You'll Learn

While building the FighterAgents simulation engine, you'll work with:

- Building intelligent agents with LangGraph
  - Agent development and orchestration
  - RAG agentic communication patterns
  - Character impersonation through prompt engineering

- Creating production-grade RAG systems
  - Vector database integration
  - Knowledge base creation
  - Advanced information retrieval

- Engineering the system architecture
  - End-to-end design (UI > Backend > Agent > Monitoring)
  - RESTful API deployment with FastAPI and Docker
  - Real-time communication via WebSockets

- Implementing advanced agent features
  - Short and long-term memory with MongoDB
  - Dynamic conversation handling
  - Real-time response generation

- Mastering industry tools and practices
  - Integration with Groq, MongoDB, Opik
  - Modern Python tooling (uv, ruff)
  - LangChain and LangGraph ecosystems

- Applying LLMOps best practices
  - Automated agent evaluation
  - Prompt monitoring and versioning
  - Evaluation dataset generation

## Project Structure

The FighterAgents simulation engine consists of two applications:

```bash
.
├── fighteragents-api/     # Backend API containing the FighterAgents simulation engine (Python)
└── fighteragents-ui/      # Frontend UI for the game (Node)
```

The `fighteragents-api` application contains all the agent simulation logic. The `fighteragents-ui` application is the game interface.

## Dataset

To impersonate our UFC fighter agents with real-world knowledge, we populate their long-term memory with data from publicly available sources. The `fighteragents-api` application downloads the data automatically when populating the long-term memory.

## Getting Started

Find detailed setup and usage instructions in the [INSTALL_AND_USAGE.md](INSTALL_AND_USAGE.md) file.

## Original Course Materials

This project is based on the open-source PhiloAgents course. The original course modules are excellent learning resources for understanding the architecture:

| Module | Written Lesson | Video Lesson | Description |
|--------|----------------|--------------|-------------|
| <div align="center">0</div>  | <a href="https://decodingml.substack.com/p/from-0-to-pro-ai-agents-roadmap"><img src="static/diagrams/episode_1_play.png" alt="Diagram 0" width="300"></a> | <div align="center">**No Video**</div> | Quick walkthrough over what you will learn in each module. |
| <div align="center">1</div>  | <a href="https://decodingml.substack.com/p/build-your-gaming-simulation-ai-agent"><img src="static/diagrams/episode_1_play.png" alt="Diagram 1" width="300"></a> | <a href="https://youtu.be/vbhShB70vFE?si=tK0hRQbEqlZMwFMm"><img src="static/thumbnails/episode_1_play.png" alt="Thumbnail 1" width="400"></a> | Architect your gaming simulation AI agent. |
| <div align="center">2</div> | <a href="https://decodingml.substack.com/p/your-first-production-ready-rag-agent"><img src="static/diagrams/episode_2_play.png" alt="Diagram 2" width="300"></a> | <a href="https://youtu.be/5fqkdiTP5Xw?si=Y1erl41qNSYlSaYx"><img src="static/thumbnails/episode_2_play.png" alt="Thumbnail 2" width="400"></a> | Building the agent in LangGraph using agentic RAG. |
| <div align="center">3</div> | <a href="https://decodingml.substack.com/p/memory-the-secret-sauce-of-ai-agents"><img src="static/diagrams/episode_3_play.png" alt="Diagram 3" width="300"></a> | <a href="https://youtu.be/xDouz4WNHV0?si=t2Wk179LQnSDY1iL"><img src="static/thumbnails/episode_3_play.png" alt="Thumbnail 3" width="400"></a> | Implementing short-term and long-term memory components. |
| <div align="center">4</div> | <a href="https://decodingml.substack.com/p/deploying-agents-as-real-time-apis"><img src="static/diagrams/episode_4_play.png" alt="Diagram 4" width="300"></a>  | <a href="https://youtu.be/svABzOASrzg?si=nylMpFm0nozPNSbi"><img src="static/thumbnails/episode_4_play.png" alt="Thumbnail 4" width="400"></a> | Expose the agent as a RESTful API (FastAPI + Websockets). |
| <div align="center">5</div> | <a href="https://decodingml.substack.com/p/observability-for-rag-agents"><img src="static/diagrams/episode_5_play.png" alt="Diagram 5" width="300"></a>  | <a href="https://youtu.be/Yy0szt5OlNI?si=otYpqM_BY2gxdxnS"><img src="static/thumbnails/episode_5_play.png" alt="Thumbnail 5" width="400"></a> | Observability for RAG agents: evaluation, monitoring, versioning. |
| <div align="center">6</div> | <a href="https://decodingml.substack.com/p/engineer-python-projects-like-a-pro"><img src="static/diagrams/episode_6_play.png" alt="Diagram 6" width="300"></a>   | <div align="center">**No Video**</div> | Structuring Python projects. Modern Python tooling. Docker setup. |

Full course video (2h 30m):

<p align="center">
    <a href="https://youtu.be/pg1Sn9rsFak?si=bKMdL-EbaMb90PT3"><img src="static/thumbnails/full_course_play.png" alt="Full Course" width="500"></a>
</p>

## Questions and Troubleshooting

Have questions or running into issues?

Open a [GitHub issue](https://github.com/Sulayam/FIGHTERAGENTS/issues) for:
- Questions about the project
- Technical troubleshooting
- Bug reports

## Contributing

Contributions are welcome! See the [contributing guide](CONTRIBUTING.md) for details.

## Attribution

This project is built on top of [PhiloAgents](https://github.com/neural-maze/philoagents-course) by [Miguel Otero Pedrido](https://github.com/MichaelisTrofficus) and [Paul Iusztin](https://github.com/iusztinpaul). The original course was created by [The Neural Maze](https://theneuralmaze.substack.com/) and [Decoding ML](https://decodingml.substack.com/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
