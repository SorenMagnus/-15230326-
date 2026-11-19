import React, { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { UAM_ROUTES } from '../../data/researchData';
import { CityCorridor3D } from '../CityCorridor3D';

export const UrbanMobilityChapter: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState(UAM_ROUTES[0].id);
  const route = UAM_ROUTES.find((r) => r.id === selectedRouteId) ?? UAM_ROUTES[0];
  const tb = route.evtolTimeBreakdownMin;

  const timeSavedVsPeak = Math.round(route.groundTimePeakMin - tb.totalDoorToDoor);

  return (
    <section
      id="chapter-05"
      className="border-b border-slate-800/80 bg-[#07090E] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-mono text-xs tracking-wider text-cyan-400">
              CHAPTER 05 · THE WORLD FROM ABOVE · 三维城市空中交通场景与门到门效率实证
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              立体城市走廊：不能忽略候机、接驳与充电的真实时间账本
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              营销宣传常只展示“空中 6 分钟直达”，却刻意回避地面最后一公里接驳与安检登机耗时。以下结合三维城市场景与全流程门到门（Door-to-Door）时间模型，对比三大代表性首发都会区航线。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {UAM_ROUTES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRouteId(r.id)}
                className={`whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                  selectedRouteId === r.id
                    ? 'border-cyan-400 bg-cyan-500 text-slate-950 font-semibold'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="mr-1.5 inline h-3.5 w-3.5" />
                {r.cityZh.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-12">
          {/* Left: 3D Urban Corridor Scene (Signature Visual #4) */}
          <div className="lg:col-span-7">
            <CityCorridor3D route={route} />
          </div>

          {/* Right: Honest Door-to-Door Breakdown & Infrastructure Bottlenecks */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0B101A] p-6">
            <div>
              <div className="font-mono text-xs text-cyan-400">{route.routeTitleEn}</div>
              <h3 className="mt-1 font-display text-xl font-semibold text-white">
                {route.routeTitleZh}
              </h3>

              {/* Door-to-Door Time Comparison */}
              <div className="mt-5 space-y-3">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-cyan-300">
                      eVTOL 门到门总耗时 (含地上接驳与安检)
                    </span>
                    <span className="font-mono font-bold text-white">
                      {tb.totalDoorToDoor} 分钟
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-4 w-full overflow-hidden rounded bg-slate-900">
                    <div
                      className="bg-slate-500"
                      style={{ width: `${(tb.firstMileAccess / route.groundTimePeakMin) * 100}%` }}
                      title={`首公里接驳 ${tb.firstMileAccess}m`}
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${(tb.vertiportCheckIn / route.groundTimePeakMin) * 100}%` }}
                      title={`安检候机 ${tb.vertiportCheckIn}m`}
                    />
                    <div
                      className="bg-cyan-400"
                      style={{
                        width: `${
                          ((tb.takeoffAndClimb + tb.cruiseFlight + tb.landingAndDisembark) /
                            route.groundTimePeakMin) *
                          100
                        }%`,
                      }}
                      title={`空中飞行 ${tb.takeoffAndClimb + tb.cruiseFlight + tb.landingAndDisembark}m`}
                    />
                    <div
                      className="bg-slate-500"
                      style={{ width: `${(tb.lastMileEgress / route.groundTimePeakMin) * 100}%` }}
                      title={`末公里离港 ${tb.lastMileEgress}m`}
                    />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-slate-400">
                    <span>接驳 {tb.firstMileAccess}m</span>
                    <span className="text-amber-300">安检登机 {tb.vertiportCheckIn}m</span>
                    <span className="text-cyan-300">
                      起降+巡航 {(tb.takeoffAndClimb + tb.cruiseFlight + tb.landingAndDisembark).toFixed(1)}m
                    </span>
                    <span>离港 {tb.lastMileEgress}m</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">地面专车高峰期耗时 ({route.groundDistanceKm} km)</span>
                    <span className="font-mono text-rose-300">{route.groundTimePeakMin} 分钟</span>
                  </div>
                  <div className="mt-1.5 h-3 w-full rounded bg-slate-900">
                    <div className="h-full rounded bg-rose-500/80" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">地面专车非高峰平峰耗时</span>
                    <span className="font-mono text-slate-300">{route.groundTimeOffPeakMin} 分钟</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full rounded bg-slate-900">
                    <div
                      className="h-full rounded bg-slate-600"
                      style={{
                        width: `${(route.groundTimeOffPeakMin / route.groundTimePeakMin) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">高峰节省时间</div>
                  <div className="mt-0.5 text-base font-bold text-emerald-400">
                    -{timeSavedVsPeak} min
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">单座预估票价</div>
                  <div className="mt-0.5 text-base font-bold text-white">
                    ${route.estimatedFarePerPaxUsd}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">过站快充耗时</div>
                  <div className="mt-0.5 text-base font-bold text-cyan-300">
                    {route.chargingTurnaroundMin} min
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-800 bg-[#070A12] p-3.5 text-xs leading-relaxed text-slate-300">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                基础设施与运营真实约束：
              </div>
              <p className="mt-1">{route.infrastructureBottleneck}</p>
              <p className="mt-1.5 font-mono text-[10px] text-slate-500">{route.sourceNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
