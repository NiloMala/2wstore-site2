import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminCustomers = () => {
	useEffect(() => {
		// Placeholder: fetch customers list when implemented
	}, []);

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>Clientes</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Lista de clientes não implementada — conteúdo de exemplo.</p>
					<div className="mt-4">
						<Button asChild>
							<Link to="/admin/pedidos">Voltar</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AdminCustomers;
