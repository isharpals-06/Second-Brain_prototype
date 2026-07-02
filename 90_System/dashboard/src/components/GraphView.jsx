import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function GraphView({ onSelectNote }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const triggerRender = () => setRenderTrigger(prev => prev + 1);

  // View state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Physics simulation state (held in refs to avoid React render delay in animation loop)
  const simulationRef = useRef({
    nodes: [],
    links: [],
    draggingNode: null,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    alpha: 1.0,
    mouseDownPos: null
  });

  // Color map for subjects
  const getSubjectColor = (filePath) => {
    if (!filePath) return '#a78bfa'; // Default light purple
    const pathLower = filePath.toLowerCase();
    if (pathLower.includes('os_notes') || pathLower.includes('/os/')) return '#3b82f6'; // Blue
    if (pathLower.includes('dsa_notes') || pathLower.includes('/dsa/')) return '#10b981'; // Green
    if (pathLower.includes('dbms_notes') || pathLower.includes('/dbms/')) return '#f59e0b'; // Amber
    if (pathLower.includes('discrete_mathematics_notes') || pathLower.includes('/discrete')) return '#ec4899'; // Pink
    if (pathLower.includes('computer_system_architecture') || pathLower.includes('/csa')) return '#8b5cf6'; // Violet
    if (pathLower.includes('cyber_cn_notes') || pathLower.includes('/cyber')) return '#06b6d4'; // Cyan
    if (pathLower.includes('ml_notes') || pathLower.includes('/ml/')) return '#f43f5e'; // Rose
    if (pathLower.includes('opps_notes') || pathLower.includes('/opps/')) return '#14b8a6'; // Teal
    if (pathLower.includes('statistics_notes') || pathLower.includes('/statistics/')) return '#84cc16'; // Lime
    return '#6b7280'; // Gray
  };

  const getSubjectName = (filePath) => {
    if (!filePath) return 'General';
    const pathLower = filePath.toLowerCase();
    if (pathLower.includes('os_notes')) return 'Operating Systems';
    if (pathLower.includes('dsa_notes')) return 'DSA';
    if (pathLower.includes('dbms_notes')) return 'DBMS';
    if (pathLower.includes('discrete_mathematics_notes')) return 'Discrete Math';
    if (pathLower.includes('computer_system_architecture')) return 'Computer Architecture';
    if (pathLower.includes('cyber_cn_notes')) return 'Cyber Security & CN';
    if (pathLower.includes('ml_notes')) return 'Machine Learning';
    if (pathLower.includes('opps_notes')) return 'OOPs';
    if (pathLower.includes('statistics_notes')) return 'Statistics';
    return 'General';
  };

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/graph');
      const data = await res.json();
      
      if (data.nodes && data.nodes.length > 0) {
        // Initialize physics nodes
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 500;
        
        // Map node positions in a clean circular layout for faster convergence
        const nodes = data.nodes.map((n, i) => {
          const angle = (i / data.nodes.length) * Math.PI * 2;
          const radius = 160 + Math.random() * 60;
          return {
            ...n,
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius,
            vx: 0,
            vy: 0,
            radius: n.label.toLowerCase().includes('moc') ? 10 : 5
          };
        });

        // Link references to node objects
        const nodeMap = {};
        nodes.forEach(n => { nodeMap[n.id] = n; });

        const links = (data.links || []).map(l => ({
          ...l,
          sourceObj: nodeMap[l.source],
          targetObj: nodeMap[l.target]
        })).filter(l => l.sourceObj && l.targetObj);

        simulationRef.current.nodes = nodes;
        simulationRef.current.links = links;
        simulationRef.current.alpha = 1.0; // Reset cooling alpha to full heat
        setGraphData({ nodes, links });
        
        // Center graph view
        setTransform({ x: 0, y: 0, k: 0.8 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const rebuildGraph = async () => {
    setRebuilding(true);
    try {
      const res = await fetch('/api/graph/rebuild', { method: 'POST' });
      await res.json();
      await fetchGraph();
    } catch (e) {
      console.error(e);
    } finally {
      setRebuilding(false);
    }
  };

  useEffect(() => {
    fetchGraph();
    
    // Resize observer
    if (containerRef.current) {
      const handleResize = () => {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Simulation physics and canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading || graphData.nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const runSimulation = () => {
      const { nodes, links, draggingNode } = simulationRef.current;
      const width = dimensions.width;
      const height = dimensions.height;

      // 1. Alpha Cooling Schedule to Stabilize and Freeze the Graph
      let alpha = simulationRef.current.alpha || 1.0;
      const alphaDecay = 0.015; // Rate at which motion cools down
      const alphaMin = 0.005;   // Threshold below which physics freezes completely

      if (alpha > alphaMin) {
        // Decrease alpha
        simulationRef.current.alpha = alpha * (1 - alphaDecay);

        // Repulsion (Coulomb law: push nodes away)
        for (let i = 0; i < nodes.length; i++) {
          const nodeA = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeB = nodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);

            if (dist < 280) {
              const force = (0.55 * (nodeA.radius * nodeB.radius)) / distSq;
              const fx = (dx / dist) * force * 150 * alpha;
              const fy = (dy / dist) * force * 150 * alpha;
              
              if (nodeA !== draggingNode) {
                nodeA.vx -= fx;
                nodeA.vy -= fy;
              }
              if (nodeB !== draggingNode) {
                nodeB.vx += fx;
                nodeB.vy += fy;
              }
            }
          }
        }

        // Link Attraction (Hooke's law: pull linked nodes)
        for (const link of links) {
          const s = link.sourceObj;
          const t = link.targetObj;
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const restLength = 80; // Tighter clusters
          const k = 0.05 * alpha; // Stiffness decreases as layout stabilizes
          
          const force = (dist - restLength) * k;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (s !== draggingNode) {
            s.vx += fx;
            s.vy += fy;
          }
          if (t !== draggingNode) {
            t.vx -= fx;
            t.vy -= fy;
          }
        }

        // Center gravity
        const centerX = width / 2;
        const centerY = height / 2;
        const gravity = 0.015 * alpha;
        for (const node of nodes) {
          if (node !== draggingNode) {
            node.vx += (centerX - node.x) * gravity;
            node.vy += (centerY - node.y) * gravity;
          }
        }

        // Update Positions with damping
        const damping = 0.8;
        for (const node of nodes) {
          if (node === draggingNode) continue;
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= damping;
          node.vy *= damping;
        }
      }

      // 3. Render Canvas
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      
      // Apply pan & zoom transform
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw Edges (Visible like Obsidian)
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const isHighlight = selectedNode && 
          (link.source === selectedNode.id || link.target === selectedNode.id);
        
        ctx.strokeStyle = isHighlight 
          ? 'rgba(139, 92, 246, 0.85)' // Glow purple for selected
          : 'rgba(255, 255, 255, 0.18)'; // Bright, clean lines like Obsidian
        
        ctx.lineWidth = isHighlight ? 1.8 : 0.8;
        
        ctx.beginPath();
        ctx.moveTo(link.sourceObj.x, link.sourceObj.y);
        ctx.lineTo(link.targetObj.x, link.targetObj.y);
        ctx.stroke();

        // Animated flow particles along highlighted links
        if (isHighlight) {
          const t = (Date.now() / 1500 + i * 0.15) % 1.0;
          const px = link.sourceObj.x + (link.targetObj.x - link.sourceObj.x) * t;
          const py = link.sourceObj.y + (link.targetObj.y - link.sourceObj.y) * t;
          
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#a78bfa';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#8b5cf6';
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
        }
      }

      // Draw Nodes
      for (const node of nodes) {
        const isMOC = node.label.toLowerCase().includes('moc');
        const color = getSubjectColor(node.source_file);
        
        // Highlight states
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const isNeighbor = selectedNode && links.some(l => 
          (l.source === selectedNode.id && l.target === node.id) ||
          (l.target === selectedNode.id && l.source === node.id)
        );

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected || isHovered ? 3 : 0), 0, Math.PI * 2);
        
        // Premium glow effects
        if (isSelected || isHovered) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // Add node border for MOCs
        if (isMOC) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Highlight connected nodes in active select state
        if (selectedNode && !isSelected && !isNeighbor) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Labels
        const showLabel = isMOC || isSelected || isHovered || isNeighbor || transform.k > 1.2;
        if (showLabel) {
          ctx.fillStyle = isSelected ? '#ffffff' : (isHovered ? '#c084fc' : '#9ca3af');
          ctx.font = isMOC ? 'bold 12px Outfit' : '10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y - node.radius - 8);
        }
      }

      ctx.restore();
      
      // Freeze simulation loop if physics cools down and no panning/dragging is active.
      // This stops continuous 60fps redrawing, dropping CPU usage to 0%.
      const isDragging = !!draggingNode;
      const shouldKeepRunning = (alpha > alphaMin) || isDragging || isPanning;

      if (shouldKeepRunning) {
        animationId = requestAnimationFrame(runSimulation);
      } else {
        console.log('Graph simulation cooled down and frozen.');
      }
    };

    animationId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animationId);
  }, [dimensions, loading, graphData, transform, selectedNode, hoveredNode, renderTrigger]);

  // Handle Pan and Drag interactions
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Track starting position to separate click from drag
    simulationRef.current.mouseDownPos = { x: clientX, y: clientY };

    // Convert screen mouse coordinates to transformed graph space
    const graphX = (clientX - transform.x) / transform.k;
    const graphY = (clientY - transform.y) / transform.k;

    // Check if clicked a node
    let clickedNode = null;
    const { nodes } = simulationRef.current;
    for (const node of nodes) {
      const dx = node.x - graphX;
      const dy = node.y - graphY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < node.radius + 6) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      simulationRef.current.draggingNode = clickedNode;
      // Temporarily wake up physics to allow dragging adjustments
      simulationRef.current.alpha = 0.25; 
      triggerRender();
    } else {
      simulationRef.current.isPanning = true;
      simulationRef.current.panStart = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const graphX = (clientX - transform.x) / transform.k;
    const graphY = (clientY - transform.y) / transform.k;

    const { draggingNode, isPanning, panStart, nodes } = simulationRef.current;

    if (draggingNode) {
      draggingNode.x = graphX;
      draggingNode.y = graphY;
      draggingNode.vx = 0;
      draggingNode.vy = 0;
      simulationRef.current.alpha = 0.25; // Continuous heating while dragging
      triggerRender();
    } else if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
    } else {
      // Hover detection
      let hovered = null;
      for (const node of nodes) {
        const dx = node.x - graphX;
        const dy = node.y - graphY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.radius + 6) {
          hovered = node;
          break;
        }
      }
      if ((hovered && !hoveredNode) || (!hovered && hoveredNode) || (hovered && hoveredNode && hovered.id !== hoveredNode.id)) {
        setHoveredNode(hovered);
        triggerRender();
      }
    }
  };

  const handleMouseUp = (e) => {
    const startPos = simulationRef.current.mouseDownPos;
    const canvas = canvasRef.current;
    
    // Check if the interaction was a static click (minimal mouse movement)
    if (startPos && canvas && e.type === 'mouseup') {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      const dx = clientX - startPos.x;
      const dy = clientY - startPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If mouse moved less than 5px, trigger selection & navigation
      if (dist < 5) {
        const graphX = (clientX - transform.x) / transform.k;
        const graphY = (clientY - transform.y) / transform.k;
        
        let clickedNode = null;
        const { nodes } = simulationRef.current;
        for (const node of nodes) {
          const ndx = node.x - graphX;
          const ndy = node.y - graphY;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (ndist < node.radius + 6) {
            clickedNode = node;
            break;
          }
        }
        
        if (clickedNode) {
          setSelectedNode(clickedNode);
          if (onSelectNote && clickedNode.source_file) {
            onSelectNote(clickedNode.source_file);
          }
        } else {
          // Clears active card overlay if clicking empty graph space
          setSelectedNode(null);
        }
        triggerRender();
      }
    }

    simulationRef.current.draggingNode = null;
    simulationRef.current.isPanning = false;
    simulationRef.current.mouseDownPos = null;
    triggerRender();
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.05;
    const nextK = e.deltaY < 0 ? transform.k * zoomFactor : transform.k / zoomFactor;
    
    // Constraint zoom range
    if (nextK < 0.15 || nextK > 5) return;

    // Zoom centered on mouse position
    const graphX = (mouseX - transform.x) / transform.k;
    const graphY = (mouseY - transform.y) / transform.k;

    setTransform({
      k: nextK,
      x: mouseX - graphX * nextK,
      y: mouseY - graphY * nextK
    });
  };

  const adjustZoom = (factor) => {
    const nextK = transform.k * factor;
    if (nextK < 0.15 || nextK > 5) return;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const graphX = (centerX - transform.x) / transform.k;
    const graphY = (centerY - transform.y) / transform.k;

    setTransform({
      k: nextK,
      x: centerX - graphX * nextK,
      y: centerY - graphY * nextK
    });
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, k: 0.8 });
    setSelectedNode(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 10
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Interactive Knowledge Graph</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Nodes: {graphData.nodes.length} | Links: {graphData.links.length}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={rebuildGraph} 
            disabled={rebuilding}
            style={{
              background: rebuilding ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-card)',
              color: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              cursor: rebuilding ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={14} className={rebuilding ? 'spin-anim' : ''} />
            {rebuilding ? 'Rebuilding Graph...' : 'Sync Graphify'}
          </button>
        </div>
      </div>

      {/* Floating Control buttons */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 20
      }}>
        <button className="glass-panel" onClick={() => adjustZoom(1.2)} style={{ padding: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ZoomIn size={18} />
        </button>
        <button className="glass-panel" onClick={() => adjustZoom(1 / 1.2)} style={{ padding: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ZoomOut size={18} />
        </button>
        <button className="glass-panel" onClick={resetView} style={{ padding: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Graph Area */}
      <div 
        ref={containerRef} 
        style={{ flexGrow: 1, overflow: 'hidden', position: 'relative', width: '100%', height: '100%', background: '#07080c' }}
      >
        {loading ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            gap: '12px'
          }}>
            <RefreshCw size={24} className="spin-anim" />
            <span>Loading semantic index graph...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ display: 'block', cursor: simulationRef.current.isPanning ? 'grabbing' : 'grab' }}
          />
        )}

        {/* Selected Node Sidebar Overlay */}
        {selectedNode && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            width: '320px',
            maxHeight: 'calc(100% - 48px)',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow)',
            zIndex: 15
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: getSubjectColor(selectedNode.source_file) + '20',
                color: getSubjectColor(selectedNode.source_file),
                border: `1px solid ${getSubjectColor(selectedNode.source_file)}40`
              }}>
                {getSubjectName(selectedNode.source_file)}
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                &times;
              </button>
            </div>
            
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 600 }}>
              {selectedNode.label}
            </h3>

            {selectedNode.source_file ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  File: <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{selectedNode.source_file}</code>
                </p>
                <button
                  onClick={() => onSelectNote(selectedNode.source_file)}
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: '6px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = 0.9}
                  onMouseOut={(e) => e.target.style.opacity = 1}
                >
                  Open Concept Note
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Conceptual index node (no source file).
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        .spin-anim {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
