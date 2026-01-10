import { useState, useCallback, type ReactNode, useEffect } from 'react'
import type { Model, AlgorithmRun } from '../../types/models'
import { ModelsContext } from './ModelsContext'
import { API } from '@/utils/api'

export function ModelsProvider({ children }: { children: ReactNode }) {
  const [allModels, setAllModels] = useState<Model[]>([])
  const [currentModel, setCurrentModelState] = useState<Model | null>(null)
  const [currentAlgorithmRun, setCurrentAlgorithmRunState] =
    useState<AlgorithmRun | null>(null)

  const fetchModels = useCallback(async () => {
    const res = await API.models.getAllModels()
    setAllModels(res.data)
  }, [])

  useEffect(() => setCurrentModel(currentModel?.modelName || ""), [allModels])
  const setCurrentModel = useCallback(
    (modelName: string) => {
      const model = allModels.find((m) => m.modelName === modelName)
      if (model) {
        setCurrentModelState(model)
      }
    },
    [allModels]
  )

  const setCurrentAlgorithmRun = useCallback(
    (runId: string) => {
      const run = currentModel?.algorithmsRuns?.find((r) => r.id === runId)
      if (run) setCurrentAlgorithmRunState(run)
    },
    [currentModel]
  )

  return (
    <ModelsContext.Provider
      value={{
        allModels,
        currentModel,
        currentAlgorithmRun,
        fetchModels,
        setCurrentModel,
        setCurrentAlgorithmRun,
      }}
    >
      {children}
    </ModelsContext.Provider>
  )
}
